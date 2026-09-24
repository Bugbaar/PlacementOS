import { Request, Response } from 'express';
import { resumeVersionService } from '../services/resumeVersionService';
import { sendSuccess, sendError } from '../utils/response';

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function handleServiceError(err: unknown, res: Response): void {
  const message = err instanceof Error ? err.message : 'Unexpected error';
  if (/not found/i.test(message)) {
    sendError(res, 'NOT_FOUND', message, 404);
    return;
  }
  if (/cannot be deleted|required/i.test(message)) {
    sendError(res, 'BAD_REQUEST', message, 400);
    return;
  }
  sendError(res, 'INTERNAL_ERROR', message, 500);
}

export const createResumeVersion = (req: Request, res: Response) => {
  try {
    const studentId = param(req.params.studentId);
    const resume = resumeVersionService.createVersion(studentId, req.body);
    sendSuccess(res, resume, 201);
  } catch (err) {
    handleServiceError(err, res);
  }
};

export const listResumeVersions = (req: Request, res: Response) => {
  const studentId = param(req.params.studentId);
  sendSuccess(res, resumeVersionService.getVersions(studentId));
};

export const getResumeVersion = (req: Request, res: Response) => {
  const studentId = param(req.params.studentId);
  const versionId = param(req.params.versionId);
  const resume = resumeVersionService.getVersion(studentId, versionId);
  if (!resume) {
    sendError(res, 'NOT_FOUND', 'Resume version not found', 404);
    return;
  }
  sendSuccess(res, resume);
};

export const activateResumeVersion = (req: Request, res: Response) => {
  try {
    const studentId = param(req.params.studentId);
    const versionId = param(req.params.versionId);
    const resume = resumeVersionService.activateVersion(studentId, versionId);
    sendSuccess(res, resume);
  } catch (err) {
    handleServiceError(err, res);
  }
};

export const deleteResumeVersion = (req: Request, res: Response) => {
  try {
    const studentId = param(req.params.studentId);
    const versionId = param(req.params.versionId);
    const resume = resumeVersionService.deleteVersion(studentId, versionId);
    sendSuccess(res, resume);
  } catch (err) {
    handleServiceError(err, res);
  }
};
