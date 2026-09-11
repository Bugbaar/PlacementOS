import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { resumeFitRouter } from './modules/resume-fit/resumeFit.controller';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/resume-fit', resumeFitRouter);

  // Multer errors (bad file type, file too large) land here since they
  // throw synchronously/via callback before the route handler's own
  // try/catch runs.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(400).json({ error: err.message });
  });

  return app;
}
