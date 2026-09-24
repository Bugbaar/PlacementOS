import { Router } from 'express';
import { createOpportunity, getOpportunities, getOpportunity, updateOpportunity, deleteOpportunity } from '../controllers/opportunityController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOpportunitySchema, updateOpportunitySchema } from '../validators/opportunityValidator';

const router = Router();

// Public read-only opportunity discovery (no student PII)
router.get('/', getOpportunities);
router.get('/:id', getOpportunity);

// Writes require admin
router.post('/', authenticate, requireAdmin, validate(createOpportunitySchema), createOpportunity);
router.put('/:id', authenticate, requireAdmin, validate(updateOpportunitySchema), updateOpportunity);
router.delete('/:id', authenticate, requireAdmin, deleteOpportunity);

export default router;
