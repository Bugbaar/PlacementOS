import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  let where = {};

  if (req.user.role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(200).json(new ApiResponse(200, [], 'No student profile.'));
    where.studentId = student.id;
  } else if (req.user.role === 'RECRUITER') {
    const company = await prisma.company.findUnique({ where: { createdBy: req.user.id } });
    if (!company) return res.status(200).json(new ApiResponse(200, [], 'No company profile.'));
    where.job = { companyId: company.id };
  }

  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            resumes: { orderBy: { createdAt: 'desc' }, take: 1, select: { atsScore: true, parsedSkills: true } },
          },
        },
        job: { include: { company: { select: { id: true, name: true, logo: true } } } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { appliedAt: 'desc' },
    }),
    prisma.application.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Applications retrieved.'
    )
  );
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes, interviewDate, interviewLink, interviewRound, offerLetterUrl, offeredSalary } = req.body;

  const validStatuses = [
    'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
    'INTERVIEW_CLEARED', 'OFFER_EXTENDED', 'SELECTED', 'REJECTED', 'WITHDRAWN',
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: { include: { company: true } } },
  });

  if (!application) {
    throw new ApiError(404, 'Application not found.');
  }

  if (req.user.role === 'RECRUITER' && application.job.company.createdBy !== req.user.id) {
    throw new ApiError(403, 'Not authorized to update this application.');
  }

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(notes && { notes }),
      ...(interviewDate && { interviewDate: new Date(interviewDate) }),
      ...(interviewLink && { interviewLink }),
      ...(interviewRound && { interviewRound }),
      ...(offerLetterUrl && { offerLetterUrl }),
      ...(offeredSalary && { offeredSalary }),
    },
    include: {
      student: { include: { user: { select: { id: true, name: true, email: true } } } },
      job: { include: { company: { select: { name: true } } } },
    },
  });

  if (status === 'SELECTED') {
    await prisma.student.update({
      where: { id: application.studentId },
      data: {
        isPlaced: true,
        placedCompany: application.job.company.name,
        placedPackage: offeredSalary || application.job.salary || 'Competitive',
      },
    });
  }

  try {
    const { enqueueNotification } = await import('../queue/notificationQueue.js');
    const studentUserId = updated.student?.user?.id || updated.student?.userId;
    if (studentUserId) {
      await enqueueNotification({
        userId: studentUserId,
        type: status === 'INTERVIEW_SCHEDULED' ? 'INTERVIEW_SCHEDULED' : 'APPLICATION_UPDATE',
        title: `Application Status: ${status.replace('_', ' ')}`,
        message: `Your application for ${updated.job.title} at ${updated.job.company.name} is now ${status}.`,
        sendEmail: true,
      });
    }
  } catch (err) {
    logger.error({ event: 'notification_enqueue_failed', error: err.message, appId: updated.id });
  }

  return res.status(200).json(new ApiResponse(200, updated, `Status updated to ${status}.`));
});

const getApplicationsByJob = asyncHandler(async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { jobId: req.params.jobId },
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          resumes: { orderBy: { createdAt: 'desc' }, take: 1, select: { atsScore: true, parsedSkills: true, strengths: true } },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return res.status(200).json(new ApiResponse(200, applications, 'Job applications retrieved.'));
});

export { getApplications, updateApplicationStatus, getApplicationsByJob };
