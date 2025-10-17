import { UserRole, UserStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import { prisma } from '../lib/prisma';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return res.status(401).json({ message: 'User is not active' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    next(error);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
