import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createPricePresetSchema, updatePricePresetSchema } from '../validation/pricePresetSchemas';

const toDecimal = (value?: number) => {
  if (value === undefined) {
    return undefined;
  }

  return new Prisma.Decimal(value);
};

export const listPricePresets = asyncHandler(async (req: Request, res: Response) => {
  const { bloggerId } = req.query;

  const presets = await prisma.pricePreset.findMany({
    where: bloggerId ? { bloggerId: Number(bloggerId) } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ presets });
});

export const createPricePreset = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createPricePresetSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid price preset payload', issues: parsed.error.issues });
  }

  const data = parsed.data;

  const preset = await prisma.pricePreset.create({
    data: {
      bloggerId: data.bloggerId,
      title: data.title,
      description: data.description,
      cost: new Prisma.Decimal(data.cost),
    },
  });

  res.status(201).json({ preset });
});

export const updatePricePreset = asyncHandler(async (req: Request, res: Response) => {
  const presetId = Number(req.params.id);

  if (Number.isNaN(presetId)) {
    return res.status(400).json({ message: 'Invalid preset id' });
  }

  const parsed = updatePricePresetSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const data = parsed.data;

  const preset = await prisma.pricePreset.update({
    where: { id: presetId },
    data: {
      bloggerId: data.bloggerId,
      title: data.title,
      description: data.description,
      cost: data.cost !== undefined ? toDecimal(data.cost) : undefined,
    },
  });

  res.json({ preset });
});

export const deletePricePreset = asyncHandler(async (req: Request, res: Response) => {
  const presetId = Number(req.params.id);

  if (Number.isNaN(presetId)) {
    return res.status(400).json({ message: 'Invalid preset id' });
  }

  await prisma.pricePreset.delete({ where: { id: presetId } });
  res.status(204).send();
});
