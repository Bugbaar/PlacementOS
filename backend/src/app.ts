import cors from 'cors';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { PlacementStore } from './data/store.js';
import { evaluateEligibility } from './domain/eligibility.js';
import { buildStudentDashboard } from './services/dashboard.js';

const studentUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    program: z.string().trim().min(2).max(80).optional(),
    branch: z.string().trim().min(2).max(80).optional(),
    graduationYear: z.number().int().min(2024).max(2035).optional(),
    cgpa: z.number().min(0).max(10).optional(),
    activeBacklogs: z.number().int().min(0).max(30).optional(),
    skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
    profileCompletion: z.number().int().min(0).max(100).optional(),
  })
  .strict();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const DEMO_PASSWORD = 'placement123';

const applicationCreateSchema = z.object({
  studentId: z.string().min(1),
  driveId: z.string().min(1),
  status: z.enum(['saved', 'applied']).default('applied'),
});

const applicationUpdateSchema = z.object({
  status: z.enum(['saved', 'applied', 'interview', 'offered', 'rejected']),
});

export function createApp(store = new PlacementStore()) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'placement-os-api' });
  });

  app.get('/api/drives/public', (_request, response) => {
    response.json({ drives: store.getDrives() });
  });

  app.get('/api/auth/demo-users', (_request, response) => {
    response.json({ users: store.getDemoStudents() });
  });

  app.post('/api/auth/login', (request, response) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Enter a valid email and password' });
      return;
    }

    const student = store.getStudentByEmail(parsed.data.email);
    if (!student || parsed.data.password !== DEMO_PASSWORD) {
      response.status(401).json({ error: 'Incorrect email or password' });
      return;
    }

    response.json({
      session: {
        studentId: student.id,
        name: student.name,
        email: student.email,
      },
    });
  });

  app.get('/api/dashboard/:studentId', (request, response) => {
    const dashboard = buildStudentDashboard(store, request.params.studentId);
    if (!dashboard) {
      response.status(404).json({ error: 'Student not found' });
      return;
    }
    response.json(dashboard);
  });

  app.patch('/api/students/:studentId', (request, response) => {
    const parsed = studentUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid student profile', details: parsed.error.issues });
      return;
    }

    const student = store.updateStudent(request.params.studentId, parsed.data);
    if (!student) {
      response.status(404).json({ error: 'Student not found' });
      return;
    }
    response.json(student);
  });

  app.post('/api/applications', (request, response) => {
    const parsed = applicationCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid application', details: parsed.error.issues });
      return;
    }

    const student = store.getStudent(parsed.data.studentId);
    const drive = store.getDrive(parsed.data.driveId);
    if (!student || !drive) {
      response.status(404).json({ error: !student ? 'Student not found' : 'Placement drive not found' });
      return;
    }

    const decision = evaluateEligibility(student, drive);
    if (parsed.data.status === 'applied' && !decision.eligible) {
      response.status(422).json({ error: 'Student is not eligible for this drive', decision });
      return;
    }

    const result = store.createApplication(
      parsed.data.studentId,
      parsed.data.driveId,
      parsed.data.status,
    );
    response.status(result.created ? 201 : 200).json(result.application);
  });

  app.patch('/api/applications/:applicationId', (request, response) => {
    const parsed = applicationUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Invalid application status' });
      return;
    }

    const application = store.updateApplicationStatus(
      request.params.applicationId,
      parsed.data.status,
    );
    if (!application) {
      response.status(404).json({ error: 'Application not found' });
      return;
    }
    response.json(application);
  });

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({ error: 'Request body must be valid JSON' });
      return;
    }
    response.status(500).json({ error: 'Unexpected server error' });
  };
  app.use(errorHandler);

  return app;
}
