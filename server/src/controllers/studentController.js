import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getProfile = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true, avatar: true },
      },
      applications: {
        include: {
          job: {
            include: { company: { select: { id: true, name: true, logo: true } } },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 10,
      },
      resumes: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }

  return res.status(200).json(new ApiResponse(200, student, 'Student profile retrieved.'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { college, branch, cgpa, batch, skills, portfolio, github, linkedin, phone, bio, location } = req.body;

  const student = await prisma.student.update({
    where: { userId: req.user.id },
    data: {
      ...(college !== undefined && { college }),
      ...(branch !== undefined && { branch }),
      ...(cgpa !== undefined && { cgpa: parseFloat(cgpa) }),
      ...(batch !== undefined && { batch }),
      ...(skills !== undefined && { skills }),
      ...(portfolio !== undefined && { portfolio }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
    },
    include: {
      user: { select: { id: true, email: true, name: true, role: true, avatar: true } },
    },
  });

  if (req.body.name) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { name: req.body.name },
    });
  }

  return res.status(200).json(new ApiResponse(200, student, 'Profile updated successfully.'));
});

const listStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, branch, batch, minCgpa, skills, isPlaced } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { college: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (branch) where.branch = { contains: branch, mode: 'insensitive' };
  if (batch) where.batch = batch;
  if (minCgpa) where.cgpa = { gte: parseFloat(minCgpa) };
  if (isPlaced !== undefined) where.isPlaced = isPlaced === 'true';
  if (skills) where.skills = { hasSome: skills.split(',').map((s) => s.trim()) };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true, avatar: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        students,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Students list retrieved.'
    )
  );
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, email: true, name: true, avatar: true } },
      resumes: { orderBy: { createdAt: 'desc' }, take: 1, select: { atsScore: true, parsedSkills: true } },
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  return res.status(200).json(new ApiResponse(200, student, 'Student details retrieved.'));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }

  const [totalApplications, shortlisted, interviews, selected, rejected, activeJobs, upcomingDrives] =
    await Promise.all([
      prisma.application.count({ where: { studentId: student.id } }),
      prisma.application.count({ where: { studentId: student.id, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { studentId: student.id, status: 'INTERVIEW_SCHEDULED' } }),
      prisma.application.count({ where: { studentId: student.id, status: 'SELECTED' } }),
      prisma.application.count({ where: { studentId: student.id, status: 'REJECTED' } }),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.placementDrive.count({ where: { status: 'UPCOMING', date: { gte: new Date() } } }),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalApplications, shortlisted, interviews, selected, rejected, activeJobs, upcomingDrives },
      'Dashboard stats retrieved.'
    )
  );
});

export { getProfile, updateProfile, listStudents, getStudentById, getDashboardStats };
