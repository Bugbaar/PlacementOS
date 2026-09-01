import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'placementos_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const activeUsersGauge = new client.Gauge({
  name: 'placementos_active_users_total',
  help: 'Total active registered users',
  registers: [register],
});

const applicationsProcessedCounter = new client.Counter({
  name: 'placementos_applications_total',
  help: 'Total count of placement applications processed',
  labelNames: ['status'],
  registers: [register],
});

const resumeAtsProcessingDuration = new client.Histogram({
  name: 'placementos_resume_ats_duration_seconds',
  help: 'Duration of AI Resume ATS analysis in seconds',
  buckets: [0.5, 1, 2, 4, 8, 15],
  registers: [register],
});

const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex.message);
  }
};

export {
  register,
  metricsHandler,
  httpRequestDurationMicroseconds,
  activeUsersGauge,
  applicationsProcessedCounter,
  resumeAtsProcessingDuration,
};

export default {
  register,
  metricsHandler,
};
