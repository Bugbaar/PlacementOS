import { jest } from '@jest/globals';
import request from 'supertest';

describe('PlacementOS API Tests', () => {
  let server;
  let authToken;
  let testUser;

  beforeAll(async () => {
    const { app } = await import('../src/app.js');
    server = app;
  });

  describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(server).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('API Info', () => {
    it('should have /metrics endpoint', async () => {
      const res = await request(server).get('/metrics');
      expect(res.status).toBe(200);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(server).get('/api/v1/unknown');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
