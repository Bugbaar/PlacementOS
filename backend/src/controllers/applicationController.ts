import { Request, Response, NextFunction } from 'express';
import Application from '../models/Application';
import Opportunity from '../models/Opportunity';
import Student from '../models/Student';
import { sendSuccess, sendError } from '../utils/response';

/** Statuses a student may set on their own application (bookmark / apply). */
const STUDENT_WRITABLE_STATUSES = new Set(['saved', 'applied']);

function isOwnerOrAdmin(req: Request, studentId: string): boolean {
  if (!req.user) return false;
  return req.user.role === 'admin' || req.user.id === studentId;
}

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, opportunityId, status, notes } = req.body;

    if (!isOwnerOrAdmin(req, studentId)) {
      return sendError(res, 'FORBIDDEN', 'You can only create applications for yourself', 403);
    }

    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 'NOT_FOUND', 'Student not found', 404);

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);

    let initialStatus = status || 'applied';
    if (req.user?.role !== 'admin') {
      if (!STUDENT_WRITABLE_STATUSES.has(initialStatus)) {
        return sendError(
          res,
          'FORBIDDEN',
          'Students can only create applications with status saved or applied',
          403,
        );
      }
    }

    const application = new Application({
      studentId,
      opportunityId,
      status: initialStatus,
      notes,
    });

    await application.save();

    // Populate opportunity for frontend convenience
    await application.populate('opportunityId');
    sendSuccess(res, application, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'DUPLICATE_APPLICATION', 'You have already applied or saved this opportunity', 409);
    }
    next(error);
  }
};

export const getStudentApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = String(req.params.studentId);
    if (!isOwnerOrAdmin(req, studentId)) {
      return sendError(res, 'FORBIDDEN', 'You can only view your own applications', 403);
    }

    const applications = await Application.find({ studentId })
      .populate('opportunityId')
      .sort({ updatedAt: -1 });
    sendSuccess(res, applications);
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return sendError(res, 'NOT_FOUND', 'Application not found', 404);
    }

    if (!isOwnerOrAdmin(req, application.studentId.toString())) {
      return sendError(res, 'FORBIDDEN', 'You can only update your own applications', 403);
    }

    if (req.body.status !== undefined) {
      const nextStatus = String(req.body.status);

      if (req.user?.role === 'admin') {
        application.status = nextStatus as typeof application.status;
      } else {
        // Students may only toggle saved ↔ applied, and only before recruiter pipeline starts
        if (!STUDENT_WRITABLE_STATUSES.has(application.status)) {
          return sendError(
            res,
            'FORBIDDEN',
            'This application is in the recruiter pipeline and can no longer be changed by the student',
            403,
          );
        }
        if (!STUDENT_WRITABLE_STATUSES.has(nextStatus)) {
          return sendError(
            res,
            'FORBIDDEN',
            'Students can only set status to saved or applied',
            403,
          );
        }
        application.status = nextStatus as typeof application.status;
      }
    }

    if (req.body.notes !== undefined) application.notes = req.body.notes;
    application.updatedAt = new Date();

    await application.save();
    await application.populate('opportunityId');

    sendSuccess(res, application);
  } catch (error) {
    next(error);
  }
};
