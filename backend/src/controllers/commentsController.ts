import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createCommentSchema } from '../validation/commentSchemas';

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const { bloggerId, counterpartyId } = req.query;

  const comments = await prisma.comment.findMany({
    where: {
      ...(bloggerId ? { bloggerId: Number(bloggerId) } : {}),
      ...(counterpartyId ? { counterpartyId: Number(counterpartyId) } : {}),
    },
    include: {
      author: true,
      blogger: true,
      counterparty: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ comments });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const parsed = createCommentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid comment payload', issues: parsed.error.issues });
  }

  const data = parsed.data;

  const comment = await prisma.comment.create({
    data: {
      body: data.body,
      bloggerId: data.bloggerId,
      counterpartyId: data.counterpartyId,
      authorId: req.currentUser.id,
      isSystem: false,
    },
    include: {
      author: true,
      blogger: true,
      counterparty: true,
    },
  });

  res.status(201).json({ comment });
});
