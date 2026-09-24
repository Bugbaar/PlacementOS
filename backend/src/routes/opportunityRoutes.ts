import { Router } from 'express';
import { createOpportunity, getOpportunities, getOpportunity, updateOpportunity, deleteOpportunity } from '../controllers/opportunityController';
import { validate } from '../middleware/validate';
import { createOpportunitySchema, updateOpportunitySchema } from '../validators/opportunityValidator';

const router = Router();

router.post('/', validate(createOpportunitySchema), createOpportunity);
router.get('/', getOpportunities);
router.get('/:id', getOpportunity);
router.put('/:id', validate(updateOpportunitySchema), updateOpportunity);
router.delete('/:id', deleteOpportunity);

export default router;
