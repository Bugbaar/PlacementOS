import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import logger from './utils/logger.js';

export function initSentry(app) {
  if (!process.env.SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.RELEASE || '1.0.0',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      const originalException = hint.originalException;
      
      if (originalException?.statusCode === 400 || originalException?.statusCode === 422) {
        return null;
      }
      
      if (originalException?.code === 'P2002') {
        return null;
      }
      
      return event;
    },
  });

  logger.info('Sentry initialized successfully');
}

export function sentryErrorHandler(app) {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setupExpressErrorHandler(app);
}

export function captureException(error, context = {}) {
  if (!process.env.SENTRY_DSN) {
    logger.error('Error (Sentry not configured):', error);
    return;
  }

  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
}

export function captureMessage(message, level = 'info') {
  if (!process.env.SENTRY_DSN) {
    logger.info(`Message (Sentry not configured): ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

export default {
  initSentry,
  sentryErrorHandler,
  captureException,
  captureMessage,
};
