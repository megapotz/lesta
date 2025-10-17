import { Placement, PlacementStatus, Prisma, User } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { createSystemComment } from './commentService';

const statusLabels: Record<PlacementStatus, string> = {
  [PlacementStatus.PLANNED]: 'Планируется',
  [PlacementStatus.AGREED]: 'Согласовано',
  [PlacementStatus.DECLINED]: 'Отклонено',
  [PlacementStatus.AWAITING_PAYMENT]: 'Ожидает оплаты',
  [PlacementStatus.AWAITING_PUBLICATION]: 'Оплачено, ждем публикацию',
  [PlacementStatus.PUBLISHED]: 'Опубликовано',
  [PlacementStatus.OVERDUE]: 'Просрочено',
  [PlacementStatus.CLOSED]: 'Завершено',
};

const toDecimal = (value?: number) => {
  if (value === undefined) {
    return undefined;
  }

  return new Prisma.Decimal(value);
};

const nonEditableStatuses = new Set<PlacementStatus>([
  PlacementStatus.DECLINED,
  PlacementStatus.CLOSED,
]);

const feeLockedStatuses = new Set<PlacementStatus>([
  PlacementStatus.AWAITING_PAYMENT,
  PlacementStatus.AWAITING_PUBLICATION,
  PlacementStatus.PUBLISHED,
  PlacementStatus.OVERDUE,
  PlacementStatus.CLOSED,
]);

const statusWithRequiredFeeAndDate = new Set<PlacementStatus>([
  PlacementStatus.AGREED,
  PlacementStatus.AWAITING_PAYMENT,
  PlacementStatus.AWAITING_PUBLICATION,
]);

const assertEditable = (placement: Placement, payloadKeys: string[]) => {
  if (nonEditableStatuses.has(placement.status)) {
    const keysWithoutStatus = payloadKeys.filter((key) => key !== 'status');
    if (keysWithoutStatus.length) {
      throw new Error('Placement cannot be edited in the current status');
    }
  }
};

const assertFeeLocked = (placement: Placement, payload: { fee?: number }) => {
  if (payload.fee !== undefined && feeLockedStatuses.has(placement.status)) {
    throw new Error('Fee cannot be changed after payment has been initiated');
  }
};

const assertRequirements = (nextStatus: PlacementStatus, payload: { fee?: number; placementDate?: string | Date | null }) => {
  if (statusWithRequiredFeeAndDate.has(nextStatus)) {
    if (payload.fee === undefined) {
      throw new Error('Fee is required for agreed or payable placements');
    }
    if (!payload.placementDate) {
      throw new Error('Placement date is required for agreed placements');
    }
  }
};

const createStatusComment = async ({
  author,
  placement,
  previousStatus,
  client,
}: {
  author: User;
  placement: Placement;
  previousStatus?: PlacementStatus;
  client?: Prisma.TransactionClient;
}) => {
  const statusText = statusLabels[placement.status];
  const previousStatusText = previousStatus ? statusLabels[previousStatus] : undefined;
  const message = previousStatusText
    ? `Статус изменен с "${previousStatusText}" на "${statusText}" менеджером ${author.name}`
    : `Размещение создано менеджером ${author.name}`;

  await createSystemComment(
    {
      authorId: author.id,
      body: message,
      bloggerId: placement.bloggerId,
      counterpartyId: placement.counterpartyId,
      placementId: placement.id,
    },
    client,
  );
};

export const createPlacement = async (
  input: {
    campaignId: number;
    bloggerId: number;
    counterpartyId: number;
    placementType: Placement['placementType'];
    pricingModel: Placement['pricingModel'];
    paymentTerms: Placement['paymentTerms'];
    status?: PlacementStatus;
    placementDate?: string;
    fee?: number;
    placementUrl?: string;
    screenshotUrl?: string;
    trackingLink?: string;
    alanbaseSub1?: string;
    eridToken?: string;
    views?: number;
    likes?: number;
    commentsCount?: number;
    shares?: number;
    roi?: number;
    engagementRate?: number;
  },
  author: User,
) => {
  const status = input.status ?? PlacementStatus.PLANNED;

  assertRequirements(status, { fee: input.fee, placementDate: input.placementDate });

  const placement = await prisma.placement.create({
    data: {
      campaignId: input.campaignId,
      bloggerId: input.bloggerId,
      counterpartyId: input.counterpartyId,
      placementType: input.placementType,
      pricingModel: input.pricingModel,
      paymentTerms: input.paymentTerms,
      status,
      placementDate: input.placementDate ? new Date(input.placementDate) : undefined,
      fee: toDecimal(input.fee),
      placementUrl: input.placementUrl,
      screenshotUrl: input.screenshotUrl,
      trackingLink: input.trackingLink,
      alanbaseSub1: input.alanbaseSub1,
      eridToken: input.eridToken,
      views: input.views,
      likes: input.likes,
      commentsCount: input.commentsCount,
      shares: input.shares,
      roi: toDecimal(input.roi),
      engagementRate: toDecimal(input.engagementRate),
      createdById: author.id,
    },
  });

  await createStatusComment({ author, placement });

  return placement;
};

export const updatePlacement = async (
  placementId: number,
  input: Partial<{
    placementType: Placement['placementType'];
    pricingModel: Placement['pricingModel'];
    paymentTerms: Placement['paymentTerms'];
    status: PlacementStatus;
    placementDate: string;
    fee: number;
    placementUrl: string;
    screenshotUrl: string;
    trackingLink: string;
    alanbaseSub1: string;
    eridToken: string;
    views: number;
    likes: number;
    commentsCount: number;
    shares: number;
    roi: number;
    engagementRate: number;
    bloggerId: number;
    counterpartyId: number;
  }>,
  author: User,
) => {
  return prisma.$transaction(async (tx) => {
    const placement = await tx.placement.findUnique({ where: { id: placementId } });

    if (!placement) {
      throw new Error('Placement not found');
    }

    const payloadKeys = Object.keys(input);

    assertEditable(placement, payloadKeys);
    assertFeeLocked(placement, input);

    const nextStatus = input.status ?? placement.status;

    assertRequirements(nextStatus, {
      fee: input.fee ?? (placement.fee ? Number(placement.fee) : undefined),
      placementDate: input.placementDate ?? placement.placementDate,
    });

    const updated = await tx.placement.update({
      where: { id: placementId },
      data: {
        placementType: input.placementType ?? placement.placementType,
        pricingModel: input.pricingModel ?? placement.pricingModel,
        paymentTerms: input.paymentTerms ?? placement.paymentTerms,
        status: nextStatus,
        placementDate: input.placementDate ? new Date(input.placementDate) : placement.placementDate,
        fee: input.fee !== undefined ? toDecimal(input.fee) : placement.fee,
        placementUrl: input.placementUrl ?? placement.placementUrl,
        screenshotUrl: input.screenshotUrl ?? placement.screenshotUrl,
        trackingLink: input.trackingLink ?? placement.trackingLink,
        alanbaseSub1: input.alanbaseSub1 ?? placement.alanbaseSub1,
        eridToken: input.eridToken ?? placement.eridToken,
        views: input.views ?? placement.views,
        likes: input.likes ?? placement.likes,
        commentsCount: input.commentsCount ?? placement.commentsCount,
        shares: input.shares ?? placement.shares,
        roi: input.roi !== undefined ? toDecimal(input.roi) : placement.roi,
        engagementRate:
          input.engagementRate !== undefined ? toDecimal(input.engagementRate) : placement.engagementRate,
        bloggerId: input.bloggerId ?? placement.bloggerId,
        counterpartyId: input.counterpartyId ?? placement.counterpartyId,
      },
    });

    if (placement.status !== nextStatus) {
      await createStatusComment({
        author,
        placement: updated,
        previousStatus: placement.status,
        client: tx,
      });
    }

    return updated;
  });
};

export const deletePlacement = async (placementId: number) => {
  const placement = await prisma.placement.findUnique({ where: { id: placementId } });

  if (!placement) {
    throw new Error('Placement not found');
  }

  if (placement.status !== PlacementStatus.PLANNED) {
    throw new Error('Only planned placements can be removed');
  }

  await prisma.placement.delete({ where: { id: placementId } });
};

export const markOverduePlacements = async () => {
  const now = new Date();

  const overdue = await prisma.placement.updateMany({
    where: {
      status: PlacementStatus.AWAITING_PUBLICATION,
      placementDate: { lt: now },
    },
    data: {
      status: PlacementStatus.OVERDUE,
    },
  });

  return overdue.count;
};
