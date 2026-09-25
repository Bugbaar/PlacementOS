import express from 'express';
import rateLimit from 'express-rate-limit';
import { chat } from '../controllers/assistantController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { chatRequestSchema } from '../validators/assistantValidator';

const router = express.Router();

// Rate limiting: 10 requests per minute for the chat endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many messages sent. Please wait a minute before trying again.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', authenticate, chatLimiter, validate(chatRequestSchema), chat);

export default router;
