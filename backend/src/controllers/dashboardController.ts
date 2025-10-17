import { CampaignStatus, CounterpartyType, PlacementStatus, Prisma, ProductCode } from '@prisma/client';
import { subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear } from 'date-fns';
import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

type PeriodKey = 'current_month' | 'last_month' | 'quarter' | 'year';

const COMPLETED_PLACEMENT_STATUSES: PlacementStatus[] = [PlacementStatus.PUBLISHED, PlacementStatus.CLOSED];
const COMMITTED_PLACEMENT_STATUSES: PlacementStatus[] = [
  PlacementStatus.AGREED,
  PlacementStatus.AWAITING_PAYMENT,
  PlacementStatus.AWAITING_PUBLICATION,
  PlacementStatus.PUBLISHED,
  PlacementStatus.OVERDUE,
  PlacementStatus.CLOSED,
];

const resolvePeriodRange = (period?: string) => {
  const today = new Date();
  const periodKey = (period as PeriodKey) ?? 'current_month';

  switch (periodKey) {
    case 'last_month': {
      const previousMonth = subMonths(today, 1);
      return {
        start: startOfMonth(previousMonth),
        end: endOfMonth(previousMonth),
        key: periodKey,
      };
    }
    case 'quarter': {
      return {
        start: startOfQuarter(today),
        end: endOfQuarter(today),
        key: periodKey,
      };
    }
    case 'year': {
      return {
        start: startOfYear(today),
        end: today,
        key: periodKey,
      };
    }
    case 'current_month':
    default: {
      return {
        start: startOfMonth(today),
        end: today,
        key: 'current_month' as PeriodKey,
      };
    }
  }
};

const toNumber = (value: Prisma.Decimal | number | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  return Number(value);
};

const clamp01 = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { period, product } = req.query;
  const { start, end, key: periodKey } = resolvePeriodRange(typeof period === 'string' ? period : undefined);

  const productFilter =
    typeof product === 'string' && Object.values(ProductCode).includes(product as ProductCode)
      ? (product as ProductCode)
      : undefined;

  const [completedPlacements, activeCampaigns] = await Promise.all([
    prisma.placement.findMany({
      where: {
        status: { in: COMPLETED_PLACEMENT_STATUSES },
        placementDate: {
          gte: start,
          lte: end,
        },
        ...(productFilter
          ? {
              campaign: {
                product: productFilter,
              },
            }
          : {}),
      },
      include: {
        blogger: true,
        counterparty: true,
        campaign: true,
      },
    }),
    prisma.campaign.findMany({
      where: {
        status: CampaignStatus.ACTIVE,
        ...(productFilter ? { product: productFilter } : {}),
      },
      include: {
        placements: true,
      },
    }),
  ]);

  const summary = completedPlacements.reduce(
    (acc, placement) => {
      const fee = toNumber(placement.fee);
      const views = placement.views ?? 0;
      const engagementRate = placement.engagementRate ? Number(placement.engagementRate) : null;

      acc.totalSpend += fee;
      acc.totalPublications += 1;
      acc.totalViews += views;
      if (engagementRate !== null && !Number.isNaN(engagementRate)) {
        acc.engagementRates.push(engagementRate);
      }

      return acc;
    },
    {
      totalSpend: 0,
      totalPublications: 0,
      totalViews: 0,
      engagementRates: [] as number[],
    },
  );

  const bloggerSpend = new Map<
    number,
    {
      name: string;
      placements: number;
      spend: number;
      views: number;
    }
  >();
  const counterpartySpend = new Map<CounterpartyType, number>();

  completedPlacements.forEach((placement) => {
    const fee = toNumber(placement.fee);
    const views = placement.views ?? 0;

    if (placement.blogger) {
      const current = bloggerSpend.get(placement.blogger.id) ?? {
        name: placement.blogger.name,
        placements: 0,
        spend: 0,
        views: 0,
      };
      current.placements += 1;
      current.spend += fee;
      current.views += views;
      bloggerSpend.set(placement.blogger.id, current);
    }

    if (placement.counterparty) {
      const current = counterpartySpend.get(placement.counterparty.type) ?? 0;
      counterpartySpend.set(placement.counterparty.type, current + fee);
    }
  });

  const topBloggers = Array.from(bloggerSpend.entries())
    .map(([bloggerId, stats]) => ({
      bloggerId,
      name: stats.name,
      placements: stats.placements,
      spend: stats.spend,
      views: stats.views,
      averageCpv: stats.views > 0 ? stats.spend / stats.views : null,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  const spendByCounterpartyType = Array.from(counterpartySpend.entries()).map(([type, spend]) => ({
    type,
    spend,
  }));

  const activeCampaignSummaries = activeCampaigns.map((campaign) => {
    const budgetPlanned = toNumber(campaign.budgetPlanned);
    const now = new Date();
    const hasDates = campaign.startDate && campaign.endDate;
    let timeProgress = 0;
    if (hasDates) {
      const totalDuration = campaign.endDate!.getTime() - campaign.startDate!.getTime();
      if (totalDuration > 0) {
        timeProgress = clamp01((now.getTime() - campaign.startDate!.getTime()) / totalDuration);
      } else {
        timeProgress = now >= campaign.endDate! ? 1 : 0;
      }
    }

    const spend = campaign.placements
      .filter((placement) => COMMITTED_PLACEMENT_STATUSES.includes(placement.status))
      .reduce((sum, placement) => sum + toNumber(placement.fee), 0);

    const budgetProgress = budgetPlanned > 0 ? clamp01(spend / budgetPlanned) : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      product: campaign.product,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budgetPlanned,
      spend,
      timeProgress,
      budgetProgress,
    };
  });

  const averageEr =
    summary.engagementRates.length > 0
      ? summary.engagementRates.reduce((acc, value) => acc + value, 0) / summary.engagementRates.length
      : null;

  const response = {
    filters: {
      period: periodKey,
      product: productFilter ?? 'ALL',
      start: start.toISOString(),
      end: end.toISOString(),
    },
    summary: {
      totalSpend: summary.totalSpend,
      totalPublications: summary.totalPublications,
      averageCpv: summary.totalViews > 0 ? summary.totalSpend / summary.totalViews : null,
      averageEr,
    },
    activeCampaigns: activeCampaignSummaries,
    topBloggers,
    spendByCounterpartyType,
  };

  res.json(response);
});
