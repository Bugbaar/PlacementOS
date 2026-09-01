export const CONFIG = {
  BCRYPT_SALT_ROUNDS: 12,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 300,
  RATE_LIMIT_USER_MAX: 100,
  QUEUE_MAX_RETRIES: 3,
  QUEUE_RETRY_DELAY: 1000,
  DB_MAX_RETRIES: 5,
  DB_RETRY_DELAY: 2000,
  REDIS_CONNECT_TIMEOUT: 30000,
  REDIS_COMMAND_TIMEOUT: 30000,
  GEMINI_TIMEOUT: 30000,
  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
};

export const ROLES = {
  STUDENT: 'STUDENT',
  RECRUITER: 'RECRUITER',
  PLACEMENT_CELL: 'PLACEMENT_CELL',
  ADMIN: 'ADMIN',
  PARENT_ADVISOR: 'PARENT_ADVISOR',
};

export const PERMISSIONS = {
  VIEW_STUDENTS: [ROLES.PLACEMENT_CELL, ROLES.RECRUITER, ROLES.ADMIN],
  MANAGE_JOBS: [ROLES.RECRUITER, ROLES.PLACEMENT_CELL],
  MANAGE_DRIVES: [ROLES.PLACEMENT_CELL, ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.PLACEMENT_CELL, ROLES.ADMIN],
  MANAGE_ANNOUNCEMENTS: [ROLES.PLACEMENT_CELL, ROLES.ADMIN],
  IMPORT_JOBS: [ROLES.ADMIN, ROLES.PLACEMENT_CELL],
  MANAGE_PARENT: [ROLES.PARENT_ADVISOR],
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Access denied. No token provided.',
  INVALID_TOKEN: 'Invalid authentication token.',
  TOKEN_EXPIRED: 'Token expired. Please login again.',
  FORBIDDEN: 'Access denied. Required role: {roles}',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation failed.',
  DUPLICATE_ENTRY: 'Duplicate entry found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  INTERNAL_ERROR: 'Internal server error.',
};

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  JOB_CREATED: 'Job posted successfully.',
  APPLICATION_SUBMITTED: 'Application submitted successfully.',
  DRIVE_CREATED: 'Drive scheduled successfully.',
  ANNOUNCEMENT_PUBLISHED: 'Announcement published.',
};

export default CONFIG;
