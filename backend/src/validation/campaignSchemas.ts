import { CampaignStatus, ProductCode } from '@prisma/client';
import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  product: z.nativeEnum(ProductCode),
  goal: z.string().optional(),
  type: z.string().optional(),
  budgetPlanned: z.number().nonnegative().optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ownerId: z.number().int().positive().optional(),
  alanbaseSub2: z.string().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();
