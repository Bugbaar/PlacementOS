import express from 'express';
import {
  getOverview,
  getBranchStats,
  getSalaryAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), getOverview);
router.get('/branch-distribution', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), getBranchStats);
router.get('/salary-metrics', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), getSalaryAnalytics);

export default router;
