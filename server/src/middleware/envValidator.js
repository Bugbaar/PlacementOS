import logger from '../utils/logger.js';

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const OPTIONAL_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'CLIENT_URL',
  'REDIS_URL',
  'GEMINI_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

export function validateEnv() {
  const missing = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please add them to your .env file');
    process.exit(1);
  }

  const configured = [];
  const notConfigured = [];

  for (const envVar of OPTIONAL_ENV_VARS) {
    if (process.env[envVar]) {
      configured.push(envVar);
    } else {
      notConfigured.push(envVar);
    }
  }

  logger.info('=== Environment Configuration ===');
  logger.info(`Required: All ${REQUIRED_ENV_VARS.length} configured ✓`);
  logger.info(`Optional configured: ${configured.length}/${OPTIONAL_ENV_VARS.length}`);

  if (notConfigured.length > 0) {
    logger.warn(`Optional not configured: ${notConfigured.join(', ')}`);
  }

  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set - AI features will not work');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn('Cloudinary not configured - file uploads will not work');
  }

  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP not configured - email notifications will not work');
  }

  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not set - background jobs will not work');
  }

  return {
    required: REQUIRED_ENV_VARS,
    configured,
    notConfigured,
  };
}

export default validateEnv;
