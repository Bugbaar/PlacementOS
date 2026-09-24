import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin, requireSelfOrAdmin } from '../src/middleware/auth';
import { signToken, verifyToken } from '../src/utils/jwt';
import { resetEnvCache } from '../src/config/env';

function mockRes() {
  const res: Partial<Response> & { statusCode?: number; body?: any } = {};
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as Response;
  });
  res.json = vi.fn((body: any) => {
    res.body = body;
    return res as Response;
  });
  return res as Response & { statusCode?: number; body?: any };
}

describe('Auth middleware', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-for-auth-middleware-32ch';
    delete process.env.CORS_ORIGIN;
    resetEnvCache();
  });

  afterEach(() => {
    resetEnvCache();
  });

  it('rejects requests without a Bearer token', () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects empty Bearer token', () => {
    const req = { headers: { authorization: 'Bearer ' } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid tokens', () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepts a valid token and attaches req.user', () => {
    const token = signToken({
      id: '507f1f77bcf86cd799439011',
      role: 'student',
      email: 'student@test.example',
    });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.email).toBe('student@test.example');
    expect(req.user?.role).toBe('student');
  });

  it('rejects tokens signed with a different secret', () => {
    const token = signToken({
      id: '507f1f77bcf86cd799439011',
      role: 'student',
      email: 'student@test.example',
    });

    process.env.JWT_SECRET = 'a-completely-different-secret-key!!';
    resetEnvCache();

    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('requireAdmin allows admins', () => {
    const req = {
      user: { id: '1', role: 'admin', email: 'admin@example.com' },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('requireAdmin forbids non-admin users', () => {
    const req = {
      user: { id: '1', role: 'student', email: 'a@b.com' },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('requireSelfOrAdmin allows the resource owner', () => {
    const req = {
      user: { id: 'abc', role: 'student', email: 'a@b.com' },
      params: { id: 'abc' },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireSelfOrAdmin('id')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('requireSelfOrAdmin forbids other students', () => {
    const req = {
      user: { id: 'abc', role: 'student', email: 'a@b.com' },
      params: { id: 'other' },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireSelfOrAdmin('id')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('verifyToken round-trips payload fields', () => {
    const token = signToken({
      id: '507f1f77bcf86cd799439011',
      role: 'admin',
      email: 'admin@test.example',
    });
    expect(verifyToken(token)).toEqual({
      id: '507f1f77bcf86cd799439011',
      role: 'admin',
      email: 'admin@test.example',
    });
  });
});
