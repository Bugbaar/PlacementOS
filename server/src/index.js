import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './db/index.js';
import { validateEnv } from './middleware/envValidator.js';
import { initializeQueue, closeQueue } from './queue/resumeQueue.js';
import { initializeNotificationQueue, closeNotificationQueue } from './queue/notificationQueue.js';
import prisma from './config/database.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info('Starting PlacementOS Server...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    validateEnv();

    await connectDB();

    initializeQueue();
    initializeNotificationQueue();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
      logger.info(`Metrics: http://localhost:${PORT}/metrics`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed.');
        
        try {
          await closeQueue();
          logger.info('Resume queue closed.');
        } catch (err) {
          logger.error('Error closing resume queue:', err);
        }

        try {
          await closeNotificationQueue();
          logger.info('Notification queue closed.');
        } catch (err) {
          logger.error('Error closing notification queue:', err);
        }

        try {
          await prisma.$disconnect();
          logger.info('Database connection closed.');
        } catch (err) {
          logger.error('Error disconnecting database:', err);
        }

        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
