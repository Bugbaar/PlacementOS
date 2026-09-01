import { randomUUID } from 'crypto';
import compression from 'compression';
import responseTime from 'response-time';
import logger from '../utils/logger.js';

export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  
  req.log = logger.child({ requestId: req.id });
  
  next();
};

export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

export const responseTimeMiddleware = responseTime((req, res, time) => {
  const stats = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${time.toFixed(2)}ms`,
    requestId: req.id,
  };

  if (time > 1000) {
    logger.warn('Slow Request', stats);
  } else {
    logger.info('Request Completed', stats);
  }
});

export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.removeHeader('X-Powered-By');
  next();
};

export default {
  requestIdMiddleware,
  compressionMiddleware,
  responseTimeMiddleware,
  securityHeaders,
};
