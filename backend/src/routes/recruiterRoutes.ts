import { Router } from 'express';
import { authenticate, requireRecruiter } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createRecruiterOpportunitySchema,
  updateRecruiterOpportunitySchema,
  updateApplicantStatusSchema,
} from '../validators/recruiterValidator';
import {
  listMyOpportunities,
  createMyOpportunity,
  updateMyOpportunity,
  listApplicants,
  updateApplicantStatus,
} from '../controllers/recruiterController';

const router = Router();

router.use(authenticate, requireRecruiter);

router.get('/opportunities', listMyOpportunities);
router.post('/opportunities', validate(createRecruiterOpportunitySchema), createMyOpportunity);
router.patch('/opportunities/:id', validate(updateRecruiterOpportunitySchema), updateMyOpportunity);
router.get('/opportunities/:id/applications', listApplicants);
router.patch('/applications/:id/status', validate(updateApplicantStatusSchema), updateApplicantStatus);

export default router;
