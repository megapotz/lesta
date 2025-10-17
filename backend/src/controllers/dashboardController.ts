import { CampaignStatus, CounterpartyType, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

type SpendAccumulator = {
  [key: number]: {
    name: string;
    placements: number;
    spend: Prisma.Decimal;
    views: number;
  };
};

type CounterpartySpend = {
  [key in CounterpartyType]?: Prisma.Decimal;
};

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [campaignCount, activeCampaigns, campaignBudget, placementFees, placements] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: CampaignStatus.ACTIVE } }),
    prisma.campaign.aggregate({ _sum: { budgetPlanned: true } }),
    prisma.placement.aggregate({
      where: {
        status: {
          in: [
            'AGREED',
            'AWAITING_PAYMENT',
            'AWAITING_PUBLICATION',
            'PUBLISHED',
            'OVERDUE',
            'CLOSED',
          ],
        },
      },
      _sum: { fee: true },
    }),
    prisma.placement.findMany({
      include: {
        blogger: true,
        counterparty: true,
      },
    }),
  ]);

  const bloggerSpend: SpendAccumulator = {};
  const counterpartySpend: CounterpartySpend = {};

  placements.forEach((placement) => {
    const fee = placement.fee ?? new Prisma.Decimal(0);
    const views = placement.views ?? 0;

    if (placement.blogger) {
      const existing = bloggerSpend[placement.blogger.id];
      if (existing) {
        bloggerSpend[placement.blogger.id] = {
          name: existing.name,
          placements: existing.placements + 1,
          spend: existing.spend.add(fee),
          views: existing.views + views,
        };
      } else {
        bloggerSpend[placement.blogger.id] = {
          name: placement.blogger.name,
          placements: 1,
          spend: fee,
          views,
        };
      }
    }

    if (placement.counterparty) {
      const type = placement.counterparty.type;
      counterpartySpend[type] = (counterpartySpend[type] ?? new Prisma.Decimal(0)).add(fee);
    }
  });

  const topBloggers = Object.entries(bloggerSpend)
    .map(([bloggerId, stats]) => ({
      bloggerId: Number(bloggerId),
      name: stats.name,
      placements: stats.placements,
      spend: Number(stats.spend),
      views: stats.views,
      averageCpv: stats.views ? Number(stats.spend) / stats.views : null,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  const spendByCounterpartyType = Object.entries(counterpartySpend).map(([type, amount]) => ({
    type,
    spend: Number(amount ?? 0),
  }));

  res.json({
    summary: {
      totalCampaigns: campaignCount,
      activeCampaigns,
      plannedBudget: Number(campaignBudget._sum.budgetPlanned ?? 0),
      totalSpend: Number(placementFees._sum.fee ?? 0),
    },
    topBloggers,
    spendByCounterpartyType,
  });
});
