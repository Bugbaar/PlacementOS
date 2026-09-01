import express from 'express';
import {
  addCompanyReview,
  getCompanyReviews,
  getCompanySentimentSummary,
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, addCompanyReview);
router.get('/company/:companyId', authenticate, getCompanyReviews);
router.get('/company/:companyId/sentiment', authenticate, getCompanySentimentSummary);

export default router;
