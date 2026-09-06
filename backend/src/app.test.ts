import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('PlacementOS API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  it('lets guests browse public opportunities without student data', async () => {
    const response = await request(app).get('/api/drives/public').expect(200);

    expect(response.body.drives).toHaveLength(5);
    expect(response.body.drives[0]).toEqual(expect.objectContaining({
      company: expect.any(String),
      role: expect.any(String),
      eligibility: expect.any(Object),
    }));
    expect(response.body.drives[0]).not.toHaveProperty('eligibilityDecision');
    expect(response.body.drives[0]).not.toHaveProperty('application');
  });

  it('supports demo sign-in without hard-coding one student', async () => {
    const users = await request(app).get('/api/auth/demo-users').expect(200);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.sharma@example.edu', password: 'placement123' })
      .expect(200);

    expect(users.body.users).toHaveLength(3);
    expect(login.body.session).toEqual({
      studentId: 'student-002',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.edu',
      token: expect.any(String),
    });
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.sharma@example.edu', password: 'wrong' })
      .expect(401);
  });

  async function loginAs(email: string) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'placement123' })
      .expect(200);
    return response.body.session.token as string;
  }

  const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  it('rejects manually constructed or forged tokens', async () => {
    await request(app)
      .get('/api/dashboard/student-001')
      .set({ Authorization: 'Bearer demo-session-student-001' })
      .expect(401);

    await request(app)
      .get('/api/dashboard/student-001')
      .set({ Authorization: 'Bearer fake-random-token' })
      .expect(401);
  });

  it('returns a student dashboard with explainable drive decisions', async () => {
    const token = await loginAs('aarav.mehta@example.edu');
    const response = await request(app)
      .get('/api/dashboard/student-001')
      .set(authHeader(token))
      .expect(200);

    expect(response.body.student.name).toBe('Aarav Mehta');
    expect(response.body.drives).toHaveLength(5);
    expect(response.body.drives[0].eligibilityDecision.checks).toHaveLength(4);
    expect(response.body.stats).toEqual({
      eligibleDrives: 3,
      totalApplications: 2,
      interviews: 1,
      offers: 0,
    });
  });

  it('rejects unauthenticated and cross-student dashboard requests', async () => {
    const priyaToken = await loginAs('priya.sharma@example.edu');
    await request(app).get('/api/dashboard/student-001').expect(401);
    await request(app)
      .get('/api/dashboard/student-001')
      .set(authHeader(priyaToken))
      .expect(403);
  });

  it('creates an application for an eligible student and prevents duplicates', async () => {
    const token = await loginAs('aarav.mehta@example.edu');
    const payload = { studentId: 'student-001', driveId: 'drive-nova-frontend' };
    const created = await request(app)
      .post('/api/applications')
      .set(authHeader(token))
      .send(payload)
      .expect(201);
    const repeated = await request(app)
      .post('/api/applications')
      .set(authHeader(token))
      .send(payload)
      .expect(200);

    expect(created.body.status).toBe('applied');
    expect(repeated.body.id).toBe(created.body.id);
  });

  it('rejects unauthenticated and cross-student application creation', async () => {
    const priyaToken = await loginAs('priya.sharma@example.edu');
    const payload = { studentId: 'student-001', driveId: 'drive-nova-frontend' };
    await request(app).post('/api/applications').send(payload).expect(401);
    await request(app)
      .post('/api/applications')
      .set(authHeader(priyaToken))
      .send(payload)
      .expect(403);
  });

  it('rejects an application when a student fails eligibility rules', async () => {
    const token = await loginAs('aarav.mehta@example.edu');
    const response = await request(app)
      .post('/api/applications')
      .set(authHeader(token))
      .send({ studentId: 'student-001', driveId: 'drive-pulse-product' })
      .expect(422);

    expect(response.body.error).toMatch(/not eligible/i);
    expect(response.body.decision.checks.some((check: { passed: boolean }) => !check.passed)).toBe(true);
  });

  it('rejects promoting a saved application to applied when the student is not eligible', async () => {
    const token = await loginAs('aarav.mehta@example.edu');
    const saved = await request(app)
      .post('/api/applications')
      .set(authHeader(token))
      .send({ studentId: 'student-001', driveId: 'drive-pulse-product', status: 'saved' })
      .expect(201);

    const response = await request(app)
      .patch(`/api/applications/${saved.body.id}`)
      .set(authHeader(token))
      .send({ status: 'applied' })
      .expect(422);

    expect(response.body.error).toMatch(/not eligible/i);
  });

  it('rejects unauthenticated application updates and masks non-owned applications as 404', async () => {
    const priyaToken = await loginAs('priya.sharma@example.edu');
    const aaravToken = await loginAs('aarav.mehta@example.edu');

    await request(app)
      .patch('/api/applications/application-atlas')
      .send({ status: 'interview' })
      .expect(401);

    // application-atlas belongs to student-001 (Aarav). Priya is student-002. Expect 404 to hide existence.
    await request(app)
      .patch('/api/applications/application-atlas')
      .set(authHeader(priyaToken))
      .send({ status: 'interview' })
      .expect(404, { error: 'Application not found' });

    // Missing application also returns 404
    await request(app)
      .patch('/api/applications/missing-application-id')
      .set(authHeader(aaravToken))
      .send({ status: 'interview' })
      .expect(404, { error: 'Application not found' });
  });

  it('validates profile updates and immediately recomputes eligibility', async () => {
    const token = await loginAs('aarav.mehta@example.edu');
    await request(app)
      .patch('/api/students/student-001')
      .set(authHeader(token))
      .send({ cgpa: 8.6 })
      .expect(200);

    const response = await request(app)
      .get('/api/dashboard/student-001')
      .set(authHeader(token))
      .expect(200);
    const pulsePay = response.body.drives.find(
      (drive: { id: string }) => drive.id === 'drive-pulse-product',
    );

    expect(pulsePay.eligibilityDecision.eligible).toBe(true);
  });

  it('rejects unauthenticated and cross-student profile updates', async () => {
    const priyaToken = await loginAs('priya.sharma@example.edu');
    await request(app).patch('/api/students/student-001').send({ cgpa: 8.5 }).expect(401);
    await request(app)
      .patch('/api/students/student-001')
      .set(authHeader(priyaToken))
      .send({ cgpa: 8.5 })
      .expect(403);
  });

  it('returns useful errors for invalid data and missing resources', async () => {
    const token = await loginAs('aarav.mehta@example.edu');
    await request(app)
      .patch('/api/students/student-001')
      .set(authHeader(token))
      .send({ cgpa: 12 })
      .expect(400);

    await request(app)
      .post('/api/applications')
      .set(authHeader(token))
      .set('Content-Type', 'application/json')
      .send('{"studentId":')
      .expect(400, { error: 'Request body must be valid JSON' });

    await request(app).get('/api/not-a-route').expect(404);
  });
});
