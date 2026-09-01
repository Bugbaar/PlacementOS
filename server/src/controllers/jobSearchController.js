import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES, CONFIG } from '../utils/constants.js';

const listJobs = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = CONFIG.PAGINATION_DEFAULT_LIMIT, 
    search, 
    type, 
    location, 
    skills, 
    branch, 
    status = 'ACTIVE', 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    minSalary,
    maxSalary,
    region,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { company: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (type) where.type = type;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (skills) where.skills = { hasSome: skills.split(',').map((s) => s.trim()) };
  if (branch) where.allowedBranches = { hasSome: [branch] };
  if (region) where.region = region;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, logo: true, industry: true } },
        _count: { select: { applications: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.job.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Jobs retrieved.'
    )
  );
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true, _count: { select: { applications: true } } },
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  let hasApplied = false;
  if (req.user && req.user.role === ROLES.STUDENT) {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });
    if (student) {
      const application = await prisma.application.findUnique({
        where: {
          studentId_jobId: {
            studentId: student.id,
            jobId: job.id,
          },
        },
      });
      hasApplied = !!application;
    }
  }

  return res.status(200).json(new ApiResponse(200, { ...job, hasApplied }, 'Job details retrieved.'));
});

const getMyJobs = asyncHandler(async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { createdBy: req.user.id },
  });

  if (!company) {
    return res.status(200).json(new ApiResponse(200, [], 'No company profile.'));
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      _count: { select: { applications: true } },
      company: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json(new ApiResponse(200, jobs, 'Recruiter jobs retrieved.'));
});

export { listJobs, getJobById, getMyJobs };
