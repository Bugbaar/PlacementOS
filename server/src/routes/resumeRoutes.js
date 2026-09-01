import express from 'express';
import {
  analyzeResume,
  getResumeHistory,
  getResumeById,
} from '../controllers/resumeController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/analyze',
  authenticate,
  authorize('STUDENT'),
  upload.single('resumeFile'),
  analyzeResume
);
router.get('/history', authenticate, authorize('STUDENT'), getResumeHistory);
router.get('/:id', authenticate, getResumeById);

export default router;
