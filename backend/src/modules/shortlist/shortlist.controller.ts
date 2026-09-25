import { randomUUID } from 'node:crypto';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { parseStudentCsv } from './csvParser';
import { runEligibilityEngine } from './eligibilityEngine';
import { buildPdf, toCsv } from './exportService';
import { dispatchShortlistNotifications, listNotifications } from './notificationService';
import { memoryStore } from './memoryStore';
import type { EligibilityCriteria, EngineRunPayload } from './types';

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.originalname.toLowerCase().endsWith('.csv') ||
      file.mimetype.includes('csv') ||
      file.mimetype === 'application/vnd.ms-excel';
    if (!ok) {
      cb(new Error('Only CSV files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const shortlistRouter = Router();
shortlistRouter.use(authenticate, requireAdmin);

shortlistRouter.post('/upload', csvUpload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'CSV file is required' });
    return;
  }

  const { students, errors } = parseStudentCsv(req.file.buffer);
  if (students.length === 0) {
    res.status(400).json({ error: 'No valid student rows found', errors });
    return;
  }

  const batchId = randomUUID();
  memoryStore.batches.set(batchId, {
    id: batchId,
    fileName: req.file.originalname,
    students,
    parseErrors: errors,
    createdAt: new Date().toISOString(),
  });

  res.json({
    batchId,
    fileName: req.file.originalname,
    count: students.length,
    parseErrors: errors,
    preview: students.slice(0, 8),
    branches: [...new Set(students.map((s) => s.branch))].sort(),
    skillUniverse: [...new Set(students.flatMap((s) => s.skills))].sort(),
  });
});

shortlistRouter.post('/run', (req: Request, res: Response) => {
  const batchId = String(req.body?.batchId ?? '');
  const criteria = req.body?.criteria as EligibilityCriteria | undefined;
  if (!batchId || !criteria) {
    res.status(400).json({ error: 'batchId and criteria are required' });
    return;
  }

  const batch = memoryStore.batches.get(batchId);
  if (!batch) {
    res.status(404).json({ error: 'Student batch not found. Upload a CSV first.' });
    return;
  }

  const normalized: EligibilityCriteria = {
    companyName: String(criteria.companyName || 'Campus Drive').trim(),
    driveName: String(criteria.driveName || 'Eligibility Pass').trim(),
    minCgpa: Number(criteria.minCgpa ?? 0),
    maxActiveBacklogs: Number(criteria.maxActiveBacklogs ?? 0),
    requiredSkills: Array.isArray(criteria.requiredSkills) ? criteria.requiredSkills : [],
    skillMatchMode: criteria.skillMatchMode === 'any' ? 'any' : 'all',
    allowedBranches: Array.isArray(criteria.allowedBranches) ? criteria.allowedBranches : [],
    minTenthPercent: criteria.minTenthPercent == null ? undefined : Number(criteria.minTenthPercent),
    minTwelfthPercent:
      criteria.minTwelfthPercent == null ? undefined : Number(criteria.minTwelfthPercent),
  };

  const { results, metrics, logs } = runEligibilityEngine(batch.students, normalized);
  const runId = randomUUID();
  const createdAt = new Date().toISOString();
  const payload: EngineRunPayload = {
    id: runId,
    batchId,
    criteria: normalized,
    results,
    metrics,
    logs,
    createdAt,
  };
  memoryStore.runs.set(runId, payload);

  const notifications = dispatchShortlistNotifications(runId, results, normalized.companyName);

  res.json({
    runId,
    metrics,
    logs,
    results,
    notifications,
    createdAt,
  });
});

shortlistRouter.get('/runs/:id', (req: Request, res: Response) => {
  const run = memoryStore.runs.get(String(req.params.id));
  if (!run) {
    res.status(404).json({ error: 'Run not found' });
    return;
  }
  res.json(run);
});

shortlistRouter.get('/runs/:id/export.csv', (req: Request, res: Response) => {
  const run = memoryStore.runs.get(String(req.params.id));
  if (!run) {
    res.status(404).json({ error: 'Run not found' });
    return;
  }
  const mode = req.query.mode === 'audit' ? 'audit' : 'shortlisted';
  const csv = toCsv(run, mode);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="placementos-${mode}-${run.id}.csv"`);
  res.send(csv);
});

shortlistRouter.get('/runs/:id/export.pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = memoryStore.runs.get(String(req.params.id));
    if (!run) {
      res.status(404).json({ error: 'Run not found' });
      return;
    }
    const pdf = await buildPdf(run);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="placementos-shortlist-${run.id}.pdf"`,
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

shortlistRouter.get('/notifications', (req: Request, res: Response) => {
  const runId = typeof req.query.runId === 'string' ? req.query.runId : undefined;
  res.json({ items: listNotifications(runId) });
});
