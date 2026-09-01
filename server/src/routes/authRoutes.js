import express from 'express';
import { register, login, getMe, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, registerSchema, loginSchema } from '../utils/validator.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: 'rl:auth',
  message: 'Too many authentication attempts. Please try again later.',
});

router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);

export default router;
