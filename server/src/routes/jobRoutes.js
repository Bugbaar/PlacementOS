import express from 'express';
import { createJob, updateJob, deleteJob } from '../controllers/jobCrudController.js';
import { listJobs, getJobById, getMyJobs } from '../controllers/jobSearchController.js';
import { applyToJob } from '../controllers/jobApplicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, jobCreateSchema } from '../utils/validator.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

const jobRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  keyPrefix: 'rl:job',
  message: 'Too many job operations. Please try again later.',
});

router.post('/', authenticate, authorize(ROLES.RECRUITER), jobRateLimiter, validateBody(jobCreateSchema), createJob);
router.get('/my-jobs', authenticate, authorize(ROLES.RECRUITER), getMyJobs);
router.get('/', authenticate, listJobs);
router.get('/:id', authenticate, getJobById);
router.put('/:id', authenticate, authorize(ROLES.RECRUITER, ROLES.PLACEMENT_CELL), jobRateLimiter, updateJob);
router.delete('/:id', authenticate, authorize(ROLES.RECRUITER, ROLES.PLACEMENT_CELL), jobRateLimiter, deleteJob);
router.post('/:id/apply', authenticate, authorize(ROLES.STUDENT), applyToJob);

export default router;
