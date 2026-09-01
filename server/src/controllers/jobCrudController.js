import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES, SUCCESS_MESSAGES } from '../utils/constants.js';

const ALLOWED_JOB_FIELDS = [
  'title', 'description', 'requirements', 'skills',
  'salary', 'location', 'type', 'status', 'deadline',
  'eligibilityCriteria', 'minCgpa', 'allowedBranches', 'openPositions', 'experience'
];

const createJob = asyncHandler(async (req, res) => {
  const {
    title, description, requirements, skills, salary,
    location, type, deadline, eligibilityCriteria,
    minCgpa, allowedBranches, openPositions, experience,
  } = req.body;

  if (!title || !description) {
    throw new ApiError(400, 'Title and description are required.');
  }

  const company = await prisma.company.findUnique({
    where: { createdBy: req.user.id },
  });

  if (!company) {
    throw new ApiError(400, 'You must create a company profile before posting jobs.');
  }

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      description,
      requirements: requirements || [],
      skills: skills || [],
      salary,
      location,
      type: type || 'FULL_TIME',
      deadline: deadline ? new Date(deadline) : null,
      eligibilityCriteria,
      minCgpa: minCgpa ? parseFloat(minCgpa) : null,
      allowedBranches: allowedBranches || [],
      openPositions: openPositions ? parseInt(openPositions) : 1,
      experience,
    },
    include: {
      company: { select: { id: true, name: true, logo: true } },
    },
  });

  return res.status(201).json(new ApiResponse(201, job, SUCCESS_MESSAGES.JOB_CREATED));
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true },
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.company.createdBy !== req.user.id && req.user.role !== ROLES.PLACEMENT_CELL) {
    throw new ApiError(403, 'Not authorized to modify this job.');
  }

  const data = {};
  for (const key of ALLOWED_JOB_FIELDS) {
    if (req.body[key] !== undefined) {
      if (key === 'deadline' && req.body.deadline) data[key] = new Date(req.body.deadline);
      else if (key === 'minCgpa' && req.body.minCgpa) data[key] = parseFloat(req.body.minCgpa);
      else if (key === 'openPositions' && req.body.openPositions) data[key] = parseInt(req.body.openPositions);
      else data[key] = req.body[key];
    }
  }

  const updated = await prisma.job.update({
    where: { id: req.params.id },
    data,
    include: {
      company: { select: { id: true, name: true, logo: true } },
    },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Job updated.'));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true },
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.company.createdBy !== req.user.id && req.user.role !== ROLES.PLACEMENT_CELL) {
    throw new ApiError(403, 'Not authorized to delete this job.');
  }

  await prisma.job.delete({ where: { id: req.params.id } });

  return res.status(200).json(new ApiResponse(200, null, 'Job deleted.'));
});

export { createJob, updateJob, deleteJob };
