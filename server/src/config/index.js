import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET required in production');
        }
        console.warn('⚠️  Using default JWT_SECRET — set env var in production');
        return 'dev-secret-not-for-production';
      }
      return process.env.JWT_SECRET;
    })(),
    refreshSecret: (() => {
      if (!process.env.JWT_REFRESH_SECRET) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_REFRESH_SECRET required in production');
        }
        console.warn('⚠️  Using default JWT_REFRESH_SECRET — set env var in production');
        return 'dev-refresh-secret-not-for-production';
      }
      return process.env.JWT_REFRESH_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

export default config;
