import {
  PaymentTerms,
  PlacementStatus,
  PlacementType,
  PricingModel,
} from '@prisma/client';
import { z } from 'zod';

const metricsSchema = z.object({
  views: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  commentsCount: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  roi: z.number().optional(),
  engagementRate: z.number().optional(),
});

export const createPlacementSchema = z
  .object({
    campaignId: z.number().int().positive(),
    bloggerId: z.number().int().positive(),
    counterpartyId: z.number().int().positive(),
    placementType: z.nativeEnum(PlacementType),
    pricingModel: z.nativeEnum(PricingModel),
    paymentTerms: z.nativeEnum(PaymentTerms),
    status: z.nativeEnum(PlacementStatus).optional(),
    placementDate: z.string().datetime().optional(),
    fee: z.number().nonnegative().optional(),
    placementUrl: z.string().url().optional(),
    screenshotUrl: z.string().url().optional(),
    trackingLink: z.string().optional(),
    alanbaseSub1: z.string().optional(),
    eridToken: z.string().optional(),
  })
  .merge(metricsSchema);

export const updatePlacementSchema = createPlacementSchema.partial();
