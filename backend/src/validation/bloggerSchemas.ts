import { ContactChannel } from '@prisma/client';
import { z } from 'zod';

const baseSchema = z.object({
  name: z.string().min(1),
  profileUrl: z.string().url(),
  socialPlatform: z.string().min(1),
  followers: z.number().int().nonnegative().optional(),
  averageReach: z.number().int().nonnegative().optional(),
  primaryChannel: z.nativeEnum(ContactChannel).optional(),
  primaryContact: z.string().optional(),
  counterpartyIds: z.array(z.number().int().positive()).optional(),
  alanbaseSub3: z.string().optional(),
});

export const createBloggerSchema = baseSchema;

export const updateBloggerSchema = baseSchema.partial();
