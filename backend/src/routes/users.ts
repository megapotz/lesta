import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { createUser, listUsers, regenerateInvite, updateUser } from '../controllers/usersController';
import { requireAuth, requireRole } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole([UserRole.ADMIN]));

usersRouter.get('/', listUsers);
usersRouter.post('/', createUser);
usersRouter.patch('/:id', updateUser);
usersRouter.post('/:id/regenerate-invite', regenerateInvite);
