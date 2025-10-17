import { Router } from 'express';

import {
  createCounterparty,
  getCounterparty,
  listCounterparties,
  updateCounterparty,
} from '../controllers/counterpartiesController';
import { requireAuth } from '../middleware/auth';

export const counterpartiesRouter = Router();

counterpartiesRouter.use(requireAuth);

counterpartiesRouter.get('/', listCounterparties);
counterpartiesRouter.post('/', createCounterparty);
counterpartiesRouter.get('/:id', getCounterparty);
counterpartiesRouter.patch('/:id', updateCounterparty);
