import { Router } from 'express';
import { createApplication, getStudentApplications, updateApplication } from '../controllers/applicationController';
import { validate } from '../middleware/validate';
import { createApplicationSchema, updateApplicationSchema } from '../validators/applicationValidator';

const router = Router();

router.post('/', validate(createApplicationSchema), createApplication);
router.get('/student/:studentId', getStudentApplications);
router.put('/:id', validate(updateApplicationSchema), updateApplication);

export default router;
