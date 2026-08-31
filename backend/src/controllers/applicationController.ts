import { Request, Response, NextFunction } from 'express';
import Application from '../models/Application';
import Opportunity from '../models/Opportunity';
import Student from '../models/Student';
import { sendSuccess, sendError } from '../utils/response';

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, opportunityId, status, notes } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 'NOT_FOUND', 'Student not found', 404);

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);

    const application = new Application({
      studentId,
      opportunityId,
      status: status || 'applied',
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
    const applications = await Application.find({ studentId: req.params.studentId })
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

    if (req.body.status) application.status = req.body.status;
    if (req.body.notes !== undefined) application.notes = req.body.notes;
    application.updatedAt = new Date();

    await application.save();
    await application.populate('opportunityId');

    sendSuccess(res, application);
  } catch (error) {
    next(error);
  }
};
