import logger from '../utils/logger.js';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

const RETRYABLE_ERROR_CODES = [
  'P1001', 'P1002', 'P1008', 'P1011', 'P1017',
  'P2024', 'P2025', 'P2034',
];

export const withRetry = (options = {}) => {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    retryableErrors = RETRYABLE_ERROR_CODES,
  } = options;

  return (handler) => async (req, res, next) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await handler(req, res, next);
      } catch (err) {
        lastError = err;
        
        const isRetryable = retryableErrors.includes(err.code) || 
                          err.message?.includes('Can\'t reach database') ||
                          err.message?.includes('connection') ||
                          err.message?.includes('timeout');

        if (!isRetryable || attempt === maxRetries) {
          throw err;
        }

        const delay = retryDelay * Math.pow(2, attempt - 1);
        logger.warn({
          message: `Database retry attempt ${attempt}/${maxRetries}`,
          error: err.message,
          requestId: req.id,
          delay,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };
};

export const retryMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.retryable = true;
  
  next();
};

export default withRetry;
