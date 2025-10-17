import { CounterpartyRelationship, CounterpartyType, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createCounterpartySchema, updateCounterpartySchema } from '../validation/counterpartySchemas';

export const listCounterparties = asyncHandler(async (req: Request, res: Response) => {
  const { type, active, search, relationshipType } = req.query;

  const counterparties = await prisma.counterparty.findMany({
    where: {
      ...(type ? { type: type as CounterpartyType } : {}),
      ...(relationshipType ? { relationshipType: relationshipType as CounterpartyRelationship } : {}),
      ...(active !== undefined && String(active).length
        ? {
            isActive: active === 'true',
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: String(search),
                },
              },
              {
                inn: {
                  contains: String(search),
                },
              },
            ],
          }
        : {}),
    },
    include: {
      bloggers: {
        include: {
          blogger: true,
        },
      },
      placements: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ counterparties });
});

export const createCounterparty = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCounterpartySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid counterparty payload', issues: parsed.error.issues });
  }

  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const data = parsed.data;

  const counterparty = await prisma.counterparty.create({
    data: {
      name: data.name,
      type: data.type,
      relationshipType: data.relationshipType,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      inn: data.inn,
      kpp: data.kpp,
      ogrn: data.ogrn,
      ogrnip: data.ogrnip,
      legalAddress: data.legalAddress,
      registrationAddress: data.registrationAddress,
      checkingAccount: data.checkingAccount,
      bankName: data.bankName,
      bik: data.bik,
      correspondentAccount: data.correspondentAccount,
      taxPhone: data.taxPhone,
      paymentDetails: data.paymentDetails,
      isActive: data.isActive ?? true,
      createdById: req.currentUser.id,
      bloggers: data.bloggerIds
        ? {
            create: data.bloggerIds.map((bloggerId) => ({
              blogger: { connect: { id: bloggerId } },
            })),
          }
        : undefined,
    },
    include: {
      bloggers: {
        include: { blogger: true },
      },
    },
  });

  res.status(201).json({ counterparty });
});

export const getCounterparty = asyncHandler(async (req: Request, res: Response) => {
  const counterpartyId = Number(req.params.id);

  if (Number.isNaN(counterpartyId)) {
    return res.status(400).json({ message: 'Invalid counterparty id' });
  }

  const counterparty = await prisma.counterparty.findUnique({
    where: { id: counterpartyId },
    include: {
      bloggers: {
        include: { blogger: true },
      },
      placements: {
        include: {
          campaign: true,
          blogger: true,
        },
      },
    },
  });

  if (!counterparty) {
    return res.status(404).json({ message: 'Counterparty not found' });
  }

  const relatedBloggerIds = counterparty.bloggers.map((item) => item.bloggerId);

  const commentFilters: Prisma.CommentWhereInput[] = [{ counterpartyId }];

  if (relatedBloggerIds.length) {
    commentFilters.push({ bloggerId: { in: relatedBloggerIds } });
  }

  const comments = await prisma.comment.findMany({
    where: { OR: commentFilters },
    include: {
      author: true,
      blogger: true,
      counterparty: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ counterparty, comments });
});

export const updateCounterparty = asyncHandler(async (req: Request, res: Response) => {
  const counterpartyId = Number(req.params.id);

  if (Number.isNaN(counterpartyId)) {
    return res.status(400).json({ message: 'Invalid counterparty id' });
  }

  const parsed = updateCounterpartySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const data = parsed.data;

  const counterparty = await prisma.$transaction(async (tx) => {
    if (data.bloggerIds) {
      await tx.bloggerCounterparty.deleteMany({ where: { counterpartyId } });
    }

    return tx.counterparty.update({
      where: { id: counterpartyId },
      data: {
        name: data.name,
        type: data.type,
        relationshipType: data.relationshipType,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        inn: data.inn,
        kpp: data.kpp,
        ogrn: data.ogrn,
        ogrnip: data.ogrnip,
        legalAddress: data.legalAddress,
        registrationAddress: data.registrationAddress,
        checkingAccount: data.checkingAccount,
        bankName: data.bankName,
        bik: data.bik,
        correspondentAccount: data.correspondentAccount,
        taxPhone: data.taxPhone,
        paymentDetails: data.paymentDetails,
        isActive: data.isActive,
        bloggers: data.bloggerIds
          ? {
              create: data.bloggerIds.map((bloggerId) => ({
                blogger: { connect: { id: bloggerId } },
              })),
            }
          : undefined,
      },
      include: {
        bloggers: { include: { blogger: true } },
      },
    });
  });

  res.json({ counterparty });
});
