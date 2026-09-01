import express from 'express';
import {
  searchExternalJobs,
  importFromLinkedIn,
  importFromIndeed,
  getExternalJobById,
  syncExternalJobs,
} from '../controllers/externalJobController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, searchExternalJobs);
router.get('/:id', authenticate, getExternalJobById);
router.post('/import/linkedin', authenticate, authorize('ADMIN', 'PLACEMENT_CELL'), importFromLinkedIn);
router.post('/import/indeed', authenticate, authorize('ADMIN', 'PLACEMENT_CELL'), importFromIndeed);
router.post('/sync', authenticate, authorize('ADMIN'), syncExternalJobs);

export default router;
