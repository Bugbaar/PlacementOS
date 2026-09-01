import express from 'express';
import {
  getCollaborativeRecommendations,
  getTrendingJobs,
} from '../controllers/recommendationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.get('/collaborative', authenticate, authorize(ROLES.STUDENT), getCollaborativeRecommendations);
router.get('/trending', authenticate, getTrendingJobs);

export default router;
