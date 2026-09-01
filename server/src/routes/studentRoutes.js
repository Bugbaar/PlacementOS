import express from 'express';
import { getProfile, updateProfile, listStudents, getStudentById, getDashboardStats } from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, studentProfileUpdateSchema } from '../utils/validator.js';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateBody(studentProfileUpdateSchema), updateProfile);
router.get('/dashboard/stats', authenticate, getDashboardStats);
router.get('/', authenticate, authorize('PLACEMENT_CELL', 'RECRUITER', 'ADMIN'), listStudents);
router.get('/:id', authenticate, getStudentById);

export default router;
