import { ApiResponse } from '../utils/ApiResponse.js';
import prisma from '../config/database.js';

const healthCheck = async (req, res) => {
  return res.status(200).json(new ApiResponse(200, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  }, 'Health check completed'));
};

const detailedHealthCheck = async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  try {
    const { getRedisClient } = await import('../queue/notificationQueue.js');
    const client = getRedisClient();
    if (client) {
      await client.ping();
      redisStatus = 'connected';
    } else {
      redisStatus = 'not_configured';
    }
  } catch (err) {
    redisStatus = 'error';
  }

  const overallStatus = dbStatus === 'connected' && redisStatus === 'connected' ? 'healthy' : 'degraded';

  return res.status(200).json(new ApiResponse(200, {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    node: process.version,
    uptime: `${Math.round(process.uptime())}s`,
    services: {
      database: { status: dbStatus },
      redis: { status: redisStatus },
      gemini: process.env.GEMINI_API_KEY ? { status: 'configured' } : { status: 'not_configured' },
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? { status: 'configured' } : { status: 'not_configured' },
    },
  }, 'Detailed health check'));
};

export { healthCheck, detailedHealthCheck };
