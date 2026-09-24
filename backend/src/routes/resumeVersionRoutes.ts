import { Router } from 'express';
import {
  createResumeVersion,
  listResumeVersions,
  getResumeVersion,
  activateResumeVersion,
  deleteResumeVersion,
} from '../controllers/resumeVersionController';
import { authenticate, requireSelfOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResumeVersionSchema } from '../validators/resumeVersionValidator';

const router = Router({ mergeParams: true });

router.use(authenticate, requireSelfOrAdmin('studentId'));

router.get('/', listResumeVersions);
router.post('/', validate(createResumeVersionSchema), createResumeVersion);
router.get('/:versionId', getResumeVersion);
router.post('/:versionId/activate', activateResumeVersion);
router.delete('/:versionId', deleteResumeVersion);

export default router;
