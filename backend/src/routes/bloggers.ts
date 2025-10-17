import { Router } from 'express';

import { createBlogger, getBlogger, listBloggers, updateBlogger } from '../controllers/bloggersController';
import { requireAuth } from '../middleware/auth';

export const bloggersRouter = Router();

bloggersRouter.use(requireAuth);

bloggersRouter.get('/', listBloggers);
bloggersRouter.post('/', createBlogger);
bloggersRouter.get('/:id', getBlogger);
bloggersRouter.patch('/:id', updateBlogger);
