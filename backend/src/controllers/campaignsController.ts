import { CampaignStatus, PlacementStatus, Prisma, ProductCode } from '@prisma/client';
import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createCampaignSchema, updateCampaignSchema } from '../validation/campaignSchemas';

const toDecimal = (value?: number) => {
  if (value === undefined) {
    return undefined;
  }

  return new Prisma.Decimal(value);
};

export const listCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { product, status, search } = req.query;

  const campaigns = await prisma.campaign.findMany({
    where: {
      ...(product ? { product: product as ProductCode } : {}),
      ...(status ? { status: status as CampaignStatus } : {}),
      ...(search
        ? {
            name: {
              contains: String(search),
            },
          }
        : {}),
    },
    include: {
      owner: true,
      _count: {
        select: {
          placements: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const campaignsWithSpend = await Promise.all(
    campaigns.map(async (campaign) => {
      const spend = await prisma.placement.aggregate({
        where: {
          campaignId: campaign.id,
          status: {
            in: [
              PlacementStatus.AGREED,
              PlacementStatus.AWAITING_PAYMENT,
              PlacementStatus.AWAITING_PUBLICATION,
              PlacementStatus.PUBLISHED,
              PlacementStatus.OVERDUE,
              PlacementStatus.CLOSED,
            ],
          },
        },
        _sum: { fee: true },
      });

      return {
        ...campaign,
        spend: spend._sum.fee ?? new Prisma.Decimal(0),
      };
    }),
  );

  res.json({ campaigns: campaignsWithSpend });
});

export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCampaignSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid campaign payload', issues: parsed.error.issues });
  }

  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const data = parsed.data;

  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      product: data.product,
      goal: data.goal,
      type: data.type,
      status: data.status ?? CampaignStatus.DRAFT,
      budgetPlanned: toDecimal(data.budgetPlanned),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      ownerId: data.ownerId ?? req.currentUser.id,
      createdById: req.currentUser.id,
      alanbaseSub2: data.alanbaseSub2,
    },
    include: {
      owner: true,
      createdBy: true,
    },
  });

  res.status(201).json({ campaign });
});

export const getCampaign = asyncHandler(async (req: Request, res: Response) => {
  const campaignId = Number(req.params.id);

  if (Number.isNaN(campaignId)) {
    return res.status(400).json({ message: 'Invalid campaign id' });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      owner: true,
      createdBy: true,
      placements: {
        include: {
          blogger: true,
          counterparty: true,
        },
      },
    },
  });

  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }

  res.json({ campaign });
});

export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const campaignId = Number(req.params.id);

  if (Number.isNaN(campaignId)) {
    return res.status(400).json({ message: 'Invalid campaign id' });
  }

  const parsed = updateCampaignSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const data = parsed.data;

  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name: data.name,
      product: data.product,
      goal: data.goal,
      type: data.type,
      status: data.status,
      budgetPlanned: data.budgetPlanned !== undefined ? toDecimal(data.budgetPlanned) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      ownerId: data.ownerId ?? undefined,
      alanbaseSub2: data.alanbaseSub2,
    },
    include: {
      owner: true,
      createdBy: true,
    },
  });

  res.json({ campaign });
});
