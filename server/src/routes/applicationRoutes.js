import express from 'express';
import {
  getApplications,
  updateApplicationStatus,
  getApplicationsByJob,
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, applicationStatusSchema } from '../utils/validator.js';

const router = express.Router();

router.get('/', authenticate, authorize('STUDENT', 'RECRUITER', 'PLACEMENT_CELL', 'ADMIN'), getApplications);
router.put('/:id/status', authenticate, authorize('RECRUITER', 'PLACEMENT_CELL', 'ADMIN'), validateBody(applicationStatusSchema), updateApplicationStatus);
router.get('/job/:jobId', authenticate, authorize('RECRUITER', 'PLACEMENT_CELL', 'ADMIN'), getApplicationsByJob);

export default router;
