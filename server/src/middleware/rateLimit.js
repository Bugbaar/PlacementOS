import { CONFIG } from '../utils/constants.js';

const clients = new Map();
const userClients = new Map();

const WINDOW_MS = CONFIG.RATE_LIMIT_WINDOW_MS;
const MAX_REQUESTS = CONFIG.RATE_LIMIT_MAX_REQUESTS;
const USER_MAX_REQUESTS = CONFIG.RATE_LIMIT_USER_MAX;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of clients) {
    if (now - value.windowStart > WINDOW_MS) {
      clients.delete(key);
    }
  }
  for (const [key, value] of userClients) {
    if (now - value.windowStart > WINDOW_MS) {
      userClients.delete(key);
    }
  }
}, 60000);

export function rateLimitMiddleware(req, res, next) {
  const clientKey = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let client = clients.get(clientKey);

  if (!client || now - client.windowStart > WINDOW_MS) {
    client = { windowStart: now, count: 0 };
    clients.set(clientKey, client);
  }

  client.count++;

  res.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  res.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - client.count).toString());
  res.set('X-RateLimit-Reset', Math.ceil((client.windowStart + WINDOW_MS) / 1000).toString());

  if (client.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((client.windowStart + WINDOW_MS - now) / 1000),
    });
  }

  next();
}

export function createRateLimiter(options = {}) {
  const {
    windowMs = WINDOW_MS,
    max = USER_MAX_REQUESTS,
    keyPrefix = 'rl',
    message = 'Too many requests, please try again later.',
  } = options;

  return (req, res, next) => {
    const userId = req.user?.id || req.ip || 'anonymous';
    const key = `${keyPrefix}:${userId}`;
    const now = Date.now();

    let record = userClients.get(key);

    if (!record || now - record.windowStart > windowMs) {
      record = { windowStart: now, count: 0 };
      userClients.set(key, record);
    }

    record.count++;

    res.set('X-RateLimit-Limit', max.toString());
    res.set('X-RateLimit-Remaining', Math.max(0, max - record.count).toString());
    res.set('X-RateLimit-Reset', Math.ceil((record.windowStart + windowMs) / 1000).toString());

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000),
      });
    }

    next();
  };
}

export default rateLimitMiddleware;
