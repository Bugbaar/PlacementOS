import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

const applyToJob = asyncHandler(async (req, res) => {
  const { coverLetter } = req.body;
  const jobId = req.params.id;

  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    throw new ApiError(400, 'Student profile not found.');
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status !== 'ACTIVE') {
    throw new ApiError(400, 'Job not found or inactive.');
  }

  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw new ApiError(400, 'Application deadline has passed.');
  }

  if (job.minCgpa && student.cgpa && student.cgpa < job.minCgpa) {
    throw new ApiError(400, `Minimum required CGPA is ${job.minCgpa}. Your CGPA: ${student.cgpa}.`);
  }

  if (job.allowedBranches?.length > 0 && student.branch) {
    if (!job.allowedBranches.includes(student.branch)) {
      throw new ApiError(400, `This job is only open for ${job.allowedBranches.join(', ')} branches.`);
    }
  }

  try {
    const application = await prisma.application.create({
      data: { studentId: student.id, jobId, coverLetter },
      include: {
        job: { include: { company: { select: { id: true, name: true, logo: true } } } },
      },
    });

    return res.status(201).json(new ApiResponse(201, application, SUCCESS_MESSAGES.APPLICATION_SUBMITTED));
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'You have already applied for this position.');
    }
    throw error;
  }
});

export { applyToJob };
