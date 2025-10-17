import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { toUserResponse } from '../utils/userMapper';
import { createUserSchema, updateUserSchema } from '../validation/userSchemas';

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ users: users.map(toUserResponse) });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid user payload', issues: parsed.error.issues });
  }

  const { email, name, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (existing) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  const inviteToken = crypto.randomBytes(24).toString('hex');
  const tempPassword = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      role,
      status: UserStatus.INVITED,
      inviteToken,
      passwordHash,
    },
  });

  res.status(201).json({
    user: toUserResponse(user),
    invite: {
      token: inviteToken,
      temporaryPassword: tempPassword,
    },
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...parsed.data,
    },
  });

  res.json({ user: toUserResponse(user) });
});

export const regenerateInvite = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const inviteToken = crypto.randomBytes(24).toString('hex');
  const tempPassword = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      inviteToken,
      passwordHash,
      status: UserStatus.INVITED,
    },
  });

  res.json({
    user: toUserResponse(user),
    invite: {
      token: inviteToken,
      temporaryPassword: tempPassword,
    },
  });
});
