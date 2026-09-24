import { Router } from 'express';
import { getStudentRecommendations } from '../controllers/recommendationController';
import { authenticate, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/:studentId', authenticate, requireSelfOrAdmin('studentId'), getStudentRecommendations);

export default router;
