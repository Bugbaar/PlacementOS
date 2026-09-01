import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import logger from '../utils/logger.js';
import geminiService from '../services/geminiService.js';

let redisClient = null;
let resumeQueue = null;
let resumeWorker = null;
let queueEnabled = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';


function getRedisOptions() {
  const isRemote = !REDIS_URL.includes('127.0.0.1') && !REDIS_URL.includes('localhost');
  
  return {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    lazyConnect: true,
    ...(isRemote && {
      connectTimeout: 30000,
      commandTimeout: 30000,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 1000, 5000);
      },
    }),
  };
}


async function checkRedisVersion(client) {
  try {
    const info = await client.info('server');
    const versionMatch = info.match(/redis_version:(\d+)\.(\d+)\.(\d+)/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      if (major < 5) {
        logger.warn(`Redis version ${major}.${minor}.x detected. BullMQ requires Redis 5.0+. Queue disabled.`);
        return false;
      }
      return true;
    }
  } catch (err) {
    logger.warn('Could not check Redis version: ' + err.message);
  }
  return false;
}


export function initializeQueue() {
  try {
    redisClient = new Redis(REDIS_URL, getRedisOptions());

    redisClient
      .connect()
      .then(async () => {
        const versionOk = await checkRedisVersion(redisClient);
        if (!versionOk) {
          logger.info('Running in DIRECT ASYNC mode (Redis version incompatible)');
          return;
        }

        logger.info('Worker connected to Redis for BullMQ queues');
        queueEnabled = true;

        resumeQueue = new Queue('resume-analysis', { connection: redisClient });

        resumeWorker = new Worker(
          'resume-analysis',
          async (job) => {
            const { resumeText, targetRole } = job.data;
            logger.info({ event: 'queue_job_start', jobId: job.id });
            const result = await geminiService.analyzeResume(resumeText, targetRole);
            return result;
          },
          { connection: redisClient, concurrency: 4 }
        );

        resumeWorker.on('completed', async (job, result) => {
          logger.info({ event: 'queue_job_completed', jobId: job.id });
          
          if (job.data.userId) {
            try {
              const { enqueueNotification } = await import('./notificationQueue.js');
              await enqueueNotification({
                userId: job.data.userId,
                type: 'ANNOUNCEMENT',
                title: 'Resume Analysis Complete',
                message: `Your AI Resume Analysis for ${job.data.targetRole || 'Software Engineer'} is ready! ATS Score: ${result?.atsScore || 'N/A'}.`,
                sendEmail: true,
              });
            } catch (err) {
              logger.warn('Failed to enqueue resume completion notification: ' + err.message);
            }
          }
        });

        resumeWorker.on('failed', (job, err) => {
          logger.error({ event: 'queue_job_failed', jobId: job?.id, error: err.message });
        });
      })
      .catch((err) => {
        logger.warn({
          msg: 'Redis not running; direct async fallback active for jobs',
          error: err.message,
        });
      });
  } catch (err) {
    logger.warn('BullMQ initialization skipped (direct async fallback mode)');
  }
}


export async function addResumeAnalysisJob(data) {
  if (!queueEnabled || !resumeQueue) {
    logger.warn('Resume queue not initialized, skipping background job');
    return null;
  }
  return await resumeQueue.add('analyze', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
  });
}


export function isQueueEnabled() {
  return queueEnabled;
}


export async function closeQueue() {
  if (resumeWorker) await resumeWorker.close();
  if (resumeQueue) await resumeQueue.close();
  if (redisClient) await redisClient.quit();
}

export default {
  initializeQueue,
  addResumeAnalysisJob,
  closeQueue,
};
