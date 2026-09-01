import express from 'express';
import {
  getParentProfile,
  linkStudent,
  unlinkStudent,
  getStudentProgress,
  getDashboardStats,
  getParentDashboard,
} from '../controllers/parentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize('PARENT_ADVISOR'));

router.get('/profile', getParentProfile);
router.get('/dashboard', getParentDashboard);
router.get('/stats', getDashboardStats);
router.post('/link-student', linkStudent);
router.delete('/unlink-student/:studentId', unlinkStudent);
router.get('/student/:studentId/progress', getStudentProgress);

export default router;
