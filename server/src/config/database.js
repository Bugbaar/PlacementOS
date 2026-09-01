import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function connectDB() {
  let retries = 5;
  let delay = 2000;

  while (retries > 0) {
    try {
      await prisma.$connect();
      logger.info('PostgreSQL Connected via Prisma (Neon Tech)');
      return;
    } catch (err) {
      retries--;
      logger.warn(`Database connection failed. Retries left: ${retries}. Error: ${err.message}`);
      
      if (retries === 0) {
        logger.error('Database connection failed after all retries');
        throw err;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

export default prisma;
