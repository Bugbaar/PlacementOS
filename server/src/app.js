import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware, securityHeaders, responseTimeMiddleware } from './middleware/security.js';
import { metricsHandler } from './utils/metrics.js';
import { healthCheck, detailedHealthCheck } from './controllers/healthController.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import externalJobRoutes from './routes/externalJobRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import plagiarismRoutes from './routes/plagiarismRoutes.js';

import passport from './middleware/oauth.js';

const app = express();

app.use(requestIdMiddleware);
app.use(securityHeaders);
app.use(helmet());
app.use(compression());
app.use(responseTimeMiddleware);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use('/uploads', express.static('uploads'));

app.use(passport.initialize());
app.use(rateLimitMiddleware);

app.get('/metrics', metricsHandler);
app.get('/health', healthCheck);
app.get('/health/detailed', detailedHealthCheck);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/drives', driveRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/external-jobs', externalJobRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/plagiarism', plagiarismRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
