import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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

  return res.status(201).json(new ApiResponse(201, job, 'Job posted successfully.'));
});

const listJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, type, location, skills, branch, status = 'ACTIVE', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
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
  if (req.user && req.user.role === 'STUDENT') {
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

const ALLOWED_JOB_FIELDS = [
  'title', 'description', 'requirements', 'skills',
  'salary', 'location', 'type', 'status', 'deadline',
  'eligibilityCriteria', 'minCgpa', 'allowedBranches', 'openPositions', 'experience'
];

const updateJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { company: true },
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  if (job.company.createdBy !== req.user.id && req.user.role !== 'PLACEMENT_CELL') {
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

  if (job.company.createdBy !== req.user.id && req.user.role !== 'PLACEMENT_CELL') {
    throw new ApiError(403, 'Not authorized to delete this job.');
  }

  await prisma.job.delete({ where: { id: req.params.id } });

  return res.status(200).json(new ApiResponse(200, null, 'Job deleted.'));
});

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

  try {
    const application = await prisma.application.create({
      data: { studentId: student.id, jobId, coverLetter },
      include: {
        job: { include: { company: { select: { id: true, name: true, logo: true } } } },
      },
    });

    return res.status(201).json(new ApiResponse(201, application, 'Application submitted.'));
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'You have already applied for this position.');
    }
    throw error;
  }
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

export { createJob, listJobs, getJobById, updateJob, deleteJob, applyToJob, getMyJobs };
