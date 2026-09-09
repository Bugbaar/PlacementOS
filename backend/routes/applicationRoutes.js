import express from 'express';
import {
  applyJob,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('STUDENT'), applyJob);
router.get('/my', protect, authorize('STUDENT'), getMyApplications);
router.get('/', protect, authorize('ADMIN'), getAllApplications);
router.put('/:id/status', protect, authorize('ADMIN'), updateApplicationStatus);

export default router;
