import { Prisma, PrismaClient } from '@prisma/client';

import { prisma } from '../lib/prisma';

type SystemCommentInput = {
  authorId: number;
  body: string;
  bloggerId?: number;
  counterpartyId?: number;
  placementId?: number;
};

export const createSystemComment = async (
  {
    authorId,
    body,
    bloggerId,
    counterpartyId,
    placementId,
  }: SystemCommentInput,
  client: Prisma.TransactionClient | PrismaClient = prisma,
) => {
  return client.comment.create({
    data: {
      authorId,
      body,
      bloggerId,
      counterpartyId,
      placementId,
      isSystem: true,
    },
  });
};
