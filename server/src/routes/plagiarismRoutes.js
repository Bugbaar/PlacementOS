import express from 'express';
import {
  checkPlagiarism,
  getPlagiarismStats,
} from '../controllers/plagiarismController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.post('/check', authenticate, authorize(ROLES.STUDENT), checkPlagiarism);
router.get('/stats', authenticate, authorize(ROLES.STUDENT), getPlagiarismStats);

export default router;
