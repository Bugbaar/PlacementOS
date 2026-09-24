import { Router } from 'express';
import { createStudent, getStudent, updateStudent, getStudents } from '../controllers/studentController';
import { authenticate, requireAdmin, requireSelfOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../validators/studentValidator';

const router = Router();

// Listing all students exposes PII — admin only
router.get('/', authenticate, requireAdmin, getStudents);
// Registration is via POST /api/auth/register; admin can still create accounts
router.post('/', authenticate, requireAdmin, validate(createStudentSchema), createStudent);
router.get('/:id', authenticate, requireSelfOrAdmin('id'), getStudent);
router.put('/:id', authenticate, requireSelfOrAdmin('id'), validate(updateStudentSchema), updateStudent);

export default router;
