import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Opportunity from '../models/Opportunity';
import Application from '../models/Application';
import { sendSuccess, sendError } from '../utils/response';

function parseDeadline(raw: string): Date | null {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isOwner(opportunity: { postedBy?: mongoose.Types.ObjectId | null }, userId: string): boolean {
  return Boolean(opportunity.postedBy && opportunity.postedBy.toString() === userId);
}

export const listMyOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const opportunities = await Opportunity.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    const opportunityIds = opportunities.map((o) => o._id);

    const counts = await Application.aggregate([
      {
        $match: {
          opportunityId: { $in: opportunityIds },
          status: { $ne: 'saved' },
        },
      },
      { $group: { _id: '$opportunityId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count as number]));

    const data = opportunities.map((opp) => ({
      ...opp.toObject(),
      applicantCount: countMap[opp._id.toString()] || 0,
    }));

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const createMyOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const deadline = parseDeadline(req.body.applicationDeadline);
    if (!deadline) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid applicationDeadline', 400);
    }

    const opportunity = new Opportunity({
      ...req.body,
      applicationDeadline: deadline,
      postedBy: req.user.id,
      status: req.body.status || 'active',
      minimumCgpa: req.body.minimumCgpa ?? 0,
      location: req.body.location || 'Not specified',
      employmentType: req.body.employmentType || 'Full-time',
      requiredSkills: req.body.requiredSkills || [],
      eligibleBranches: req.body.eligibleBranches || [],
      eligibleGraduationYears: req.body.eligibleGraduationYears || [],
    });

    await opportunity.save();
    sendSuccess(res, { ...opportunity.toObject(), applicantCount: 0 }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMyOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    if (!isOwner(opportunity, req.user.id)) {
      return sendError(res, 'FORBIDDEN', 'You can only edit your own postings', 403);
    }

    const { postedBy: _postedBy, ...updates } = req.body;
    if (updates.applicationDeadline !== undefined) {
      const deadline = parseDeadline(String(updates.applicationDeadline));
      if (!deadline) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid applicationDeadline', 400);
      }
      updates.applicationDeadline = deadline;
    }

    Object.assign(opportunity, updates);
    await opportunity.save();
    sendSuccess(res, opportunity);
  } catch (error) {
    next(error);
  }
};

export const listApplicants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    if (!isOwner(opportunity, req.user.id)) {
      return sendError(res, 'FORBIDDEN', 'You can only view applicants for your own postings', 403);
    }

    const applications = await Application.find({
      opportunityId: opportunity._id,
      status: { $ne: 'saved' },
    })
      .populate('studentId', 'name email branch cgpa college graduationYear skills resumeUrl')
      .sort({ appliedAt: -1 });

    const data = applications.map((app) => {
      const student = app.studentId as unknown as {
        _id: mongoose.Types.ObjectId;
        name?: string;
        email?: string;
        branch?: string;
        cgpa?: number;
        college?: string;
        graduationYear?: number;
        skills?: string[];
        resumeUrl?: string;
      } | null;

      return {
        _id: app._id,
        opportunityId: app.opportunityId,
        status: app.status,
        notes: app.notes,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        studentId: student?._id ?? app.studentId,
        studentName: student?.name ?? 'Unknown',
        studentEmail: student?.email ?? '',
        branch: student?.branch,
        cgpa: student?.cgpa,
        college: student?.college,
        graduationYear: student?.graduationYear,
        skills: student?.skills ?? [],
        resumeUrl: student?.resumeUrl ?? null,
      };
    });

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateApplicantStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const application = await Application.findById(req.params.id);
    if (!application) return sendError(res, 'NOT_FOUND', 'Application not found', 404);

    const opportunity = await Opportunity.findById(application.opportunityId);
    if (!opportunity) return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    if (!isOwner(opportunity, req.user.id)) {
      return sendError(res, 'FORBIDDEN', 'You can only update applicants for your own postings', 403);
    }

    application.status = req.body.status;
    application.updatedAt = new Date();
    await application.save();

    await application.populate('studentId', 'name email branch cgpa college graduationYear skills resumeUrl');
    const student = application.studentId as unknown as {
      _id: mongoose.Types.ObjectId;
      name?: string;
      email?: string;
      resumeUrl?: string;
    } | null;

    sendSuccess(res, {
      _id: application._id,
      opportunityId: application.opportunityId,
      status: application.status,
      notes: application.notes,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt,
      studentId: student?._id ?? application.studentId,
      studentName: student?.name ?? 'Unknown',
      studentEmail: student?.email ?? '',
      resumeUrl: student?.resumeUrl ?? null,
    });
  } catch (error) {
    next(error);
  }
};
