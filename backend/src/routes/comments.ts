import { Router } from 'express';

import { createComment, listComments } from '../controllers/commentsController';
import { requireAuth } from '../middleware/auth';

export const commentsRouter = Router();

commentsRouter.use(requireAuth);

commentsRouter.get('/', listComments);
commentsRouter.post('/', createComment);
