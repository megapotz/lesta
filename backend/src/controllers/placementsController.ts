import { PlacementStatus, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createPlacement, deletePlacement, markOverduePlacements, updatePlacement } from '../services/placementService';
import { createPlacementSchema, updatePlacementSchema } from '../validation/placementSchemas';

const upload = multer({ storage: multer.memoryStorage() });

export const placementUploadMiddleware = upload.single('file');

const placementIncludes = {
  campaign: true,
  blogger: true,
  counterparty: true,
};

export const listPlacements = asyncHandler(async (req: Request, res: Response) => {
  await markOverduePlacements();

  const { status, campaignId, bloggerId, counterpartyId } = req.query;

  const placements = await prisma.placement.findMany({
    where: {
      ...(status ? { status: status as PlacementStatus } : {}),
      ...(campaignId ? { campaignId: Number(campaignId) } : {}),
      ...(bloggerId ? { bloggerId: Number(bloggerId) } : {}),
      ...(counterpartyId ? { counterpartyId: Number(counterpartyId) } : {}),
    },
    include: placementIncludes,
    orderBy: [{ placementDate: 'desc' }, { createdAt: 'desc' }],
  });

  res.json({ placements });
});

export const createPlacementHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const parsed = createPlacementSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid placement payload', issues: parsed.error.issues });
  }

  const created = await createPlacement(parsed.data, req.currentUser);

  const placement = await prisma.placement.findUnique({
    where: { id: created.id },
    include: placementIncludes,
  });

  res.status(201).json({ placement });
});

export const getPlacement = asyncHandler(async (req: Request, res: Response) => {
  const placementId = Number(req.params.id);

  if (Number.isNaN(placementId)) {
    return res.status(400).json({ message: 'Invalid placement id' });
  }

  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: {
      ...placementIncludes,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!placement) {
    return res.status(404).json({ message: 'Placement not found' });
  }

  res.json({ placement });
});

export const updatePlacementHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const placementId = Number(req.params.id);

  if (Number.isNaN(placementId)) {
    return res.status(400).json({ message: 'Invalid placement id' });
  }

  const parsed = updatePlacementSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  try {
    const updated = await updatePlacement(placementId, parsed.data, req.currentUser);

    const placement = await prisma.placement.findUnique({
      where: { id: updated.id },
      include: placementIncludes,
    });

    res.json({ placement });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export const deletePlacementHandler = asyncHandler(async (req: Request, res: Response) => {
  const placementId = Number(req.params.id);

  if (Number.isNaN(placementId)) {
    return res.status(400).json({ message: 'Invalid placement id' });
  }

  try {
    await deletePlacement(placementId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export const exportPlacements = asyncHandler(async (req: Request, res: Response) => {
  const { status, campaignId } = req.query;

  const where: Prisma.PlacementWhereInput = {
    status: status ? (status as PlacementStatus) : PlacementStatus.AWAITING_PAYMENT,
  };

  if (campaignId) {
    const parsed = Number(campaignId);
    if (!Number.isNaN(parsed)) {
      where.campaignId = parsed;
    }
  }

  const placements = await prisma.placement.findMany({
    where,
    include: placementIncludes,
  });

  const rows = placements.map((placement) => ({
    Counterparty: placement.counterparty?.name ?? '',
    INN: placement.counterparty?.inn ?? '',
    Amount: placement.fee ? Number(placement.fee) : 0,
    Campaign: placement.campaign?.name ?? '',
    Blogger: placement.blogger?.name ?? '',
    PlacementDate: placement.placementDate ? placement.placementDate.toISOString().slice(0, 10) : '',
    Status: placement.status,
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Placements');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="placements_export.xlsx"');
  res.send(buffer);
});

export const importPlacements = asyncHandler(async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName]);

  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  for (const row of data) {
    const rawId = row.ID ?? row.PlacementID ?? row.placementId ?? row.id;
    if (!rawId) {
      skipped += 1;
      continue;
    }

    const placementId = Number(rawId);

    if (Number.isNaN(placementId)) {
      skipped += 1;
      continue;
    }

    const placement = await prisma.placement.findUnique({ where: { id: placementId } });

    if (!placement) {
      notFound += 1;
      continue;
    }

    if (placement.status !== PlacementStatus.AWAITING_PAYMENT) {
      skipped += 1;
      continue;
    }

    try {
      await updatePlacement(placementId, { status: PlacementStatus.AWAITING_PUBLICATION }, req.currentUser);
      updated += 1;
    } catch (error) {
      skipped += 1;
    }
  }

  res.json({ summary: { updated, notFound, skipped } });
});
