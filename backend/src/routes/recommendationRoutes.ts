import { Router } from 'express';
import { getStudentRecommendations } from '../controllers/recommendationController';

const router = Router();

router.get('/:studentId', getStudentRecommendations);

export default router;
