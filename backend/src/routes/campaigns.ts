import { Router } from 'express';

import { createCampaign, getCampaign, listCampaigns, updateCampaign } from '../controllers/campaignsController';
import { requireAuth } from '../middleware/auth';

export const campaignsRouter = Router();

campaignsRouter.use(requireAuth);

campaignsRouter.get('/', listCampaigns);
campaignsRouter.post('/', createCampaign);
campaignsRouter.get('/:id', getCampaign);
campaignsRouter.patch('/:id', updateCampaign);
