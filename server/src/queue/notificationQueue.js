import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from '../services/emailService.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

let notificationQueue = null;
let notificationWorker = null;
let redisClient = null;
let notificationQueueEnabled = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function checkRedisVersion(client) {
  try {
    const info = await client.info('server');
    const versionMatch = info.match(/redis_version:(\d+)\.(\d+)\.(\d+)/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      if (major < 5) {
        logger.warn(`Redis version ${major}.${minor}.x detected. BullMQ requires Redis 5.0+. Notification Queue disabled.`);
        return false;
      }
      return true;
    }
  } catch (err) {
    logger.warn('Could not check Redis version: ' + err.message);
  }
  return false;
}

async function executeNotificationDirectly(data) {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });

    if (data.sendEmail) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: data.title,
          html: `<p>${data.message}</p>${data.link ? `<p><a href="${data.link}">View Details</a></p>` : ''}`,
          text: `${data.message}\n${data.link ? `Link: ${data.link}` : ''}`,
        });
      }
    }
  } catch (err) {
    logger.error('Direct notification execution failed: ' + err.message);
  }
}

export function initializeNotificationQueue() {
  try {
    const isRemote = !REDIS_URL.includes('127.0.0.1') && !REDIS_URL.includes('localhost');

    redisClient = new Redis(REDIS_URL, {
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
    });

    redisClient
      .connect()
      .then(async () => {
        const versionOk = await checkRedisVersion(redisClient);
        if (!versionOk) {
          logger.info('Running Notification Queue in DIRECT ASYNC mode (Redis version incompatible)');
          return;
        }

        logger.info('Connected to Redis for BullMQ Notification queues');
        notificationQueueEnabled = true;

        notificationQueue = new Queue('notifications', { connection: redisClient });

        notificationWorker = new Worker(
          'notifications',
          async (job) => {
            const { userId, type, title, message, link, sendEmail: shouldEmail } = job.data;
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user) return;

            await prisma.notification.create({
              data: { userId, type, title, message, link },
            });

            if (shouldEmail && user.email) {
              await sendEmail({
                to: user.email,
                subject: title,
                html: `<p>${message}</p>${link ? `<p><a href="${link}">View Details</a></p>` : ''}`,
                text: `${message}\n${link ? `Link: ${link}` : ''}`,
              });
            }
          },
          { connection: redisClient, concurrency: 5 }
        );

        notificationWorker.on('completed', (job) => {
          logger.info({ event: 'notification_job_completed', jobId: job.id });
        });

        notificationWorker.on('failed', (job, err) => {
          logger.error({ event: 'notification_job_failed', jobId: job?.id, error: err.message });
        });
      })
      .catch((err) => {
        logger.warn({
          msg: 'Redis not running locally for Notifications',
          error: err.message,
        });
      });
  } catch (err) {
    logger.warn('BullMQ Notification init skipped');
  }
}

export async function enqueueNotification(data) {
  if (!notificationQueueEnabled || !notificationQueue) {
    logger.warn('Notification queue not initialized, executing directly');
    await executeNotificationDirectly(data);
    return null;
  }
  return await notificationQueue.add('send', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
  });
}

export function getRedisClient() {
  return redisClient;
}

export async function closeNotificationQueue() {
  if (notificationWorker) await notificationWorker.close();
  if (notificationQueue) await notificationQueue.close();
  if (redisClient) await redisClient.quit();
}

export default { initializeNotificationQueue, enqueueNotification, closeNotificationQueue };
