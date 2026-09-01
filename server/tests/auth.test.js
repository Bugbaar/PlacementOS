import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.GEMINI_API_KEY = 'test-gemini-key';

describe('Authentication Tests', () => {
  let server;

  beforeAll(async () => {
    const { app } = await import('../src/app.js');
    server = app;
  });

  describe('POST /api/v1/auth/register', () => {
    it('should validate required fields', async () => {
      const res = await request(server)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(422);
    });

    it('should validate email format', async () => {
      const res = await request(server)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        });
      expect(res.status).toBe(422);
    });

    it('should validate password length', async () => {
      const res = await request(server)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: '123',
          name: 'Test User',
        });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should validate required fields', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(422);
    });
  });

  describe('Protected Routes', () => {
    it('should reject requests without token', async () => {
      const res = await request(server).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid tokens', async () => {
      const res = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('should reject malformed auth header', async () => {
      const res = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat token123');
      expect(res.status).toBe(401);
    });
  });
});
