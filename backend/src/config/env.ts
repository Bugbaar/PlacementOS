/**
 * Fail-fast environment validation for the backend.
 * Never log secret values from this module.
 */

const WEAK_JWT_SECRETS = new Set([
  '',
  'change_me_to_a_long_random_secret',
  'dev-only-jwt-secret-change-me',
  'secret',
  'jwt_secret',
]);

export type AppEnv = {
  nodeEnv: string;
  isProd: boolean;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[] | null; // null = reflect/allow default (dev only)
  trustProxy: boolean;
};

function requireStrongJwtSecret(raw: string | undefined, isProd: boolean): string {
  const secret = (raw || '').trim();
  const tooShort = secret.length < 32;
  const weak = WEAK_JWT_SECRETS.has(secret);

  if (isProd) {
    if (!secret || weak || tooShort) {
      throw new Error(
        'JWT_SECRET must be set to a strong random value (min 32 chars) in production'
      );
    }
    return secret;
  }

  if (!secret || weak) {
    // Safe local default — never use this in production (blocked above).
    return 'dev-only-jwt-secret-change-me-min-32-chars!!';
  }
  return secret;
}

export function loadEnv(): AppEnv {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  const jwtSecret = requireStrongJwtSecret(process.env.JWT_SECRET, isProd);
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/placementos';

  let corsOrigins: string[] | null = null;
  const corsRaw = process.env.CORS_ORIGIN?.trim();
  if (corsRaw) {
    corsOrigins = corsRaw.split(',').map((o) => o.trim()).filter(Boolean);
  } else if (isProd) {
    throw new Error(
      'CORS_ORIGIN must be set in production (comma-separated allowlist, e.g. https://app.example.com)'
    );
  }

  const port = Number(process.env.PORT || 5000);
  if (!Number.isFinite(port) || port < 1) {
    throw new Error('PORT must be a valid positive number');
  }

  const resolved: AppEnv = {
    nodeEnv,
    isProd,
    port,
    mongoUri,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigins,
    trustProxy: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
  };

  cached = resolved;
  return resolved;
}

/** Singleton loaded at startup (after dotenv). */
let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cached) {
    return loadEnv();
  }
  return cached;
}

/** Test helper to clear cached env between cases. */
export function resetEnvCache(): void {
  cached = null;
}
