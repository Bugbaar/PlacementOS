import { env } from './config/bootstrap';
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import applicationRoutes from './routes/applicationRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import assistantRoutes from './routes/assistantRoutes';
import resumeVersionRoutes from './routes/resumeVersionRoutes';
import { resumeFitRouter } from './modules/resume-fit/resumeFit.controller';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  if (env.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());

  const corsOptions: cors.CorsOptions = env.corsOrigins
    ? {
        origin: env.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }
    : {
        origin: true,
      };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '100kb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.isProd ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    },
  });

  app.use('/api', apiLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/opportunities', opportunityRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/students/:studentId/resumes', resumeVersionRoutes);
  app.use('/api/resume-fit', resumeFitRouter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Multer rejects (bad type / too large) before the route try/catch.
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err?.message === 'Only PDF files are accepted' || err?.name === 'MulterError') {
      return res.status(400).json({ error: err.message });
    }
    return next(err);
  });

  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
