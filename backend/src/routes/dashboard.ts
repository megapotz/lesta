import { Router } from 'express';

import { getDashboard } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/', getDashboard);
