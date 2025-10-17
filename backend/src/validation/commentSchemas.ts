import { z } from 'zod';

export const createCommentSchema = z
  .object({
    body: z.string().min(1),
    bloggerId: z.number().int().positive().optional(),
    counterpartyId: z.number().int().positive().optional(),
  })
  .refine((data) => data.bloggerId || data.counterpartyId, {
    message: 'Either bloggerId or counterpartyId must be provided',
    path: ['bloggerId', 'counterpartyId'],
  });
