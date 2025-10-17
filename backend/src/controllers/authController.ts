import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../utils/jwt';
import { toUserResponse } from '../utils/userMapper';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const parseDuration = (value: string) => {
  try {
    const parsed = ms(value as ms.StringValue);
    return typeof parsed === 'number' ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const cookieMaxAge = parseDuration(env.ACCESS_TOKEN_TTL) ?? (ms('1h' as ms.StringValue) as number);

export const loginHandler = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.status !== UserStatus.ACTIVE) {
    return res.status(403).json({ message: 'User is not active' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signAccessToken({ userId: user.id, role: user.role });

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    maxAge: typeof cookieMaxAge === 'number' ? cookieMaxAge : undefined,
  });

  res.json({ user: toUserResponse(user) });
};

export const logoutHandler = (_req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
  });
  res.status(204).send();
};

export const meHandler = (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  res.json({ user: toUserResponse(req.currentUser) });
};
