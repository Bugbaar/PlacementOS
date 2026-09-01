import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createDrive = asyncHandler(async (req, res) => {
  const { companyId, title, description, date, eligibility, minCgpa, allowedBranches, rounds, venue, coordinator, packageOffered } = req.body;

  if (!companyId || !title || !date) {
    throw new ApiError(400, 'Company, drive title, and date are required.');
  }

  const drive = await prisma.placementDrive.create({
    data: {
      companyId,
      title,
      description,
      date: new Date(date),
      eligibility,
      minCgpa: minCgpa ? parseFloat(minCgpa) : null,
      allowedBranches: allowedBranches || [],
      rounds: rounds || ['Online Assessment', 'Technical Interview', 'HR Round'],
      venue: venue || 'Campus Auditorium / Virtual',
      coordinator,
      packageOffered: packageOffered || 'Competitive',
    },
    include: { company: { select: { id: true, name: true, logo: true, industry: true } } },
  });

  return res.status(201).json(new ApiResponse(201, drive, 'Placement drive scheduled.'));
});

const listDrives = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [drives, total] = await Promise.all([
    prisma.placementDrive.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, logo: true, website: true, location: true } },
        _count: { select: { registrations: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { date: 'asc' },
    }),
    prisma.placementDrive.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        drives,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Drives retrieved.'
    )
  );
});

const getDriveById = asyncHandler(async (req, res) => {
  const drive = await prisma.placementDrive.findUnique({
    where: { id: req.params.id },
    include: {
      company: { include: { jobs: { where: { status: 'ACTIVE' } } } },
      registrations: {
        include: { student: { include: { user: { select: { name: true, email: true, avatar: true } } } } },
      },
    },
  });

  if (!drive) {
    throw new ApiError(404, 'Drive not found.');
  }

  let isRegistered = false;
  if (req.user && req.user.role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (student) {
      const reg = await prisma.driveRegistration.findUnique({
        where: { driveId_studentId: { driveId: drive.id, studentId: student.id } },
      });
      isRegistered = !!reg;
    }
  }

  return res.status(200).json(new ApiResponse(200, { ...drive, isRegistered }, 'Drive details retrieved.'));
});

const registerForDrive = asyncHandler(async (req, res) => {
  const driveId = req.params.id;
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });

  if (!student) {
    throw new ApiError(400, 'Student profile required to register.');
  }

  const drive = await prisma.placementDrive.findUnique({ where: { id: driveId } });
  if (!drive) {
    throw new ApiError(404, 'Placement drive not found.');
  }

  if (drive.minCgpa && student.cgpa && student.cgpa < drive.minCgpa) {
    throw new ApiError(400, `Minimum CGPA is ${drive.minCgpa}. Your CGPA is ${student.cgpa}.`);
  }

  if (drive.allowedBranches?.length > 0 && student.branch) {
    if (!drive.allowedBranches.includes(student.branch)) {
      throw new ApiError(400, `Drive open for ${drive.allowedBranches.join(', ')} branches only.`);
    }
  }

  try {
    const registration = await prisma.driveRegistration.create({
      data: { driveId, studentId: student.id },
    });

    return res.status(201).json(new ApiResponse(201, registration, 'Registered for placement drive.'));
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'Already registered for this drive.');
    }
    throw error;
  }
});

const updateDrive = asyncHandler(async (req, res) => {
  const { date, minCgpa, ...rest } = req.body;

  const updated = await prisma.placementDrive.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(date && { date: new Date(date) }),
      ...(minCgpa && { minCgpa: parseFloat(minCgpa) }),
    },
    include: { company: { select: { id: true, name: true, logo: true } } },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Drive updated.'));
});

const deleteDrive = asyncHandler(async (req, res) => {
  await prisma.placementDrive.delete({ where: { id: req.params.id } });
  return res.status(200).json(new ApiResponse(200, null, 'Drive deleted.'));
});

export { createDrive, listDrives, getDriveById, registerForDrive, updateDrive, deleteDrive };
