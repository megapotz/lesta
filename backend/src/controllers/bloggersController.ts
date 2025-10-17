import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createBloggerSchema, updateBloggerSchema } from '../validation/bloggerSchemas';

export const listBloggers = asyncHandler(async (req: Request, res: Response) => {
  const { search, social, counterpartyId } = req.query;

  const bloggers = await prisma.blogger.findMany({
    where: {
      ...(search
        ? {
            name: {
              contains: String(search),
            },
          }
        : {}),
      ...(social ? { socialPlatform: String(social) } : {}),
      ...(counterpartyId
        ? {
            counterparties: {
              some: {
                counterpartyId: Number(counterpartyId),
              },
            },
          }
        : {}),
    },
    include: {
      counterparties: {
        include: {
          counterparty: true,
        },
      },
      pricePresets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ bloggers });
});

export const createBlogger = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createBloggerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid blogger payload', issues: parsed.error.issues });
  }

  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const data = parsed.data;

  const blogger = await prisma.blogger.create({
    data: {
      name: data.name,
      profileUrl: data.profileUrl,
      socialPlatform: data.socialPlatform,
      followers: data.followers,
      averageReach: data.averageReach,
      primaryChannel: data.primaryChannel,
      primaryContact: data.primaryContact,
      alanbaseSub3: data.alanbaseSub3,
      createdById: req.currentUser.id,
      counterparties: data.counterpartyIds
        ? {
            create: data.counterpartyIds.map((counterpartyId) => ({
              counterparty: { connect: { id: counterpartyId } },
            })),
          }
        : undefined,
    },
    include: {
      counterparties: {
        include: { counterparty: true },
      },
      pricePresets: true,
    },
  });

  res.status(201).json({ blogger });
});

export const getBlogger = asyncHandler(async (req: Request, res: Response) => {
  const bloggerId = Number(req.params.id);

  if (Number.isNaN(bloggerId)) {
    return res.status(400).json({ message: 'Invalid blogger id' });
  }

  const blogger = await prisma.blogger.findUnique({
    where: { id: bloggerId },
    include: {
      counterparties: {
        include: { counterparty: true },
      },
      pricePresets: true,
      placements: {
        include: {
          campaign: true,
        },
      },
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!blogger) {
    return res.status(404).json({ message: 'Blogger not found' });
  }

  res.json({ blogger });
});

export const updateBlogger = asyncHandler(async (req: Request, res: Response) => {
  const bloggerId = Number(req.params.id);

  if (Number.isNaN(bloggerId)) {
    return res.status(400).json({ message: 'Invalid blogger id' });
  }

  const parsed = updateBloggerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const data = parsed.data;

  const blogger = await prisma.$transaction(async (tx) => {
    if (data.counterpartyIds) {
      await tx.bloggerCounterparty.deleteMany({ where: { bloggerId } });
    }

    return tx.blogger.update({
      where: { id: bloggerId },
      data: {
        name: data.name,
        profileUrl: data.profileUrl,
        socialPlatform: data.socialPlatform,
        followers: data.followers,
        averageReach: data.averageReach,
        primaryChannel: data.primaryChannel,
        primaryContact: data.primaryContact,
        alanbaseSub3: data.alanbaseSub3,
        counterparties: data.counterpartyIds
          ? {
              create: data.counterpartyIds.map((counterpartyId) => ({
                counterparty: { connect: { id: counterpartyId } },
              })),
            }
          : undefined,
      },
      include: {
        counterparties: { include: { counterparty: true } },
        pricePresets: true,
      },
    });
  });

  res.json({ blogger });
});
