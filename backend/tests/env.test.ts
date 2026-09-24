import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadEnv, resetEnvCache } from '../src/config/env';

describe('env validation', () => {
  const original = { ...process.env };

  beforeEach(() => {
    resetEnvCache();
    process.env = { ...original };
    delete process.env.JWT_SECRET;
    delete process.env.CORS_ORIGIN;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env = { ...original };
    resetEnvCache();
  });

  it('allows development without JWT_SECRET (uses safe local default)', () => {
    const env = loadEnv();
    expect(env.isProd).toBe(false);
    expect(env.jwtSecret.length).toBeGreaterThanOrEqual(32);
  });

  it('rejects weak JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'change_me_to_a_long_random_secret';
    process.env.CORS_ORIGIN = 'https://app.example.com';
    expect(() => loadEnv()).toThrow(/JWT_SECRET/);
  });

  it('rejects short JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short-secret';
    process.env.CORS_ORIGIN = 'https://app.example.com';
    expect(() => loadEnv()).toThrow(/JWT_SECRET/);
  });

  it('requires CORS_ORIGIN in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a-sufficiently-long-production-jwt-secret-key';
    delete process.env.CORS_ORIGIN;
    expect(() => loadEnv()).toThrow(/CORS_ORIGIN/);
  });

  it('parses CORS allowlist', () => {
    process.env.JWT_SECRET = 'a-sufficiently-long-production-jwt-secret-key';
    process.env.CORS_ORIGIN = 'https://a.example.com, https://b.example.com';
    const env = loadEnv();
    expect(env.corsOrigins).toEqual(['https://a.example.com', 'https://b.example.com']);
  });
});
