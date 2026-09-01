import express from 'express';
import {
  chat,
  getMockInterviewQuestions,
  getPlacementReadiness,
  getRecommendedJobs,
} from '../controllers/aiController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticate, chat);
router.post('/interview-prep', authenticate, getMockInterviewQuestions);
router.get('/readiness-score', authenticate, authorize('STUDENT'), getPlacementReadiness);
router.get('/recommended-jobs', authenticate, authorize('STUDENT'), getRecommendedJobs);

export default router;
