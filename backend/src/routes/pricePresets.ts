import { Router } from 'express';

import {
  createPricePreset,
  deletePricePreset,
  listPricePresets,
  updatePricePreset,
} from '../controllers/pricePresetsController';
import { requireAuth } from '../middleware/auth';

export const pricePresetsRouter = Router();

pricePresetsRouter.use(requireAuth);

pricePresetsRouter.get('/', listPricePresets);
pricePresetsRouter.post('/', createPricePreset);
pricePresetsRouter.patch('/:id', updatePricePreset);
pricePresetsRouter.delete('/:id', deletePricePreset);
