import { z } from 'zod';

export const createPricePresetSchema = z.object({
  bloggerId: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional(),
  cost: z.number().nonnegative(),
});

export const updatePricePresetSchema = createPricePresetSchema.partial();
