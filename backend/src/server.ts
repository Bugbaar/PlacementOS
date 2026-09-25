import mongoose from 'mongoose';
import { env } from './config/bootstrap';
import app from './app';
import { logger } from './utils/logger';

mongoose
  .connect(env.mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port}`, { env: env.nodeEnv });
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', {
      message: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  });
