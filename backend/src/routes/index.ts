import { Router } from 'express';

import { authRouter } from './auth';
import { bloggersRouter } from './bloggers';
import { campaignsRouter } from './campaigns';
import { commentsRouter } from './comments';
import { counterpartiesRouter } from './counterparties';
import { dashboardRouter } from './dashboard';
import { placementsRouter } from './placements';
import { pricePresetsRouter } from './pricePresets';
import { usersRouter } from './users';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/bloggers', bloggersRouter);
apiRouter.use('/campaigns', campaignsRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/counterparties', counterpartiesRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/placements', placementsRouter);
apiRouter.use('/price-presets', pricePresetsRouter);
apiRouter.use('/users', usersRouter);
