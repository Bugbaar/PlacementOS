import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('ADMIN'), createJob);
router.put('/:id', protect, authorize('ADMIN'), updateJob);
router.delete('/:id', protect, authorize('ADMIN'), deleteJob);

export default router;
