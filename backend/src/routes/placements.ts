import { Router } from 'express';

import {
  createPlacementHandler,
  deletePlacementHandler,
  exportPlacements,
  getPlacement,
  importPlacements,
  listPlacements,
  placementUploadMiddleware,
  updatePlacementHandler,
} from '../controllers/placementsController';
import { requireAuth } from '../middleware/auth';

export const placementsRouter = Router();

placementsRouter.use(requireAuth);

placementsRouter.get('/', listPlacements);
placementsRouter.post('/', createPlacementHandler);
placementsRouter.get('/export', exportPlacements);
placementsRouter.post('/import', placementUploadMiddleware, importPlacements);
placementsRouter.get('/:id', getPlacement);
placementsRouter.patch('/:id', updatePlacementHandler);
placementsRouter.delete('/:id', deletePlacementHandler);
