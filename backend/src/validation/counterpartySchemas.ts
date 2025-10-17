import { CounterpartyRelationship, CounterpartyType } from '@prisma/client';
import { z } from 'zod';

const baseSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(CounterpartyType),
  relationshipType: z.nativeEnum(CounterpartyRelationship),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  inn: z.string().optional(),
  kpp: z.string().optional(),
  ogrn: z.string().optional(),
  ogrnip: z.string().optional(),
  legalAddress: z.string().optional(),
  registrationAddress: z.string().optional(),
  checkingAccount: z.string().optional(),
  bankName: z.string().optional(),
  bik: z.string().optional(),
  correspondentAccount: z.string().optional(),
  taxPhone: z.string().optional(),
  paymentDetails: z.string().optional(),
  isActive: z.boolean().optional(),
  bloggerIds: z.array(z.number().int().positive()).optional(),
});

export const createCounterpartySchema = baseSchema;

export const updateCounterpartySchema = baseSchema.partial();
