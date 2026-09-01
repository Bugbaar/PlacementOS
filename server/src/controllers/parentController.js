import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getParentProfile = asyncHandler(async (req, res) => {
  const parent = await prisma.parentAdvisor.findUnique({
    where: { userId: req.user.id },
    include: {
      watchingStudents: {
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
              applications: {
                include: { job: { include: { company: { select: { name: true } } } } },
                orderBy: { appliedAt: 'desc' },
                take: 5,
              },
            },
          },
        },
      },
    },
  });

  if (!parent) {
    throw new ApiError(404, 'Parent/Advisor profile not found.');
  }

  return res.status(200).json(new ApiResponse(200, parent, 'Parent profile retrieved.'));
});

const linkStudent = asyncHandler(async (req, res) => {
  const { studentEmail, relation } = req.body;

  if (!studentEmail) {
    throw new ApiError(400, 'Student email is required.');
  }

  const parent = await prisma.parentAdvisor.findUnique({
    where: { userId: req.user.id },
  });

  if (!parent) {
    throw new ApiError(404, 'Parent/Advisor profile not found.');
  }

  const student = await prisma.student.findFirst({
    where: { user: { email: studentEmail } },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found with this email.');
  }

  try {
    const link = await prisma.studentParent.create({
      data: {
        studentId: student.id,
        parentId: parent.id,
        relation: relation || 'Parent',
      },
    });

    return res.status(201).json(new ApiResponse(201, link, 'Student linked successfully.'));
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'This student is already linked to your account.');
    }
    throw error;
  }
});

const unlinkStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const parent = await prisma.parentAdvisor.findUnique({
    where: { userId: req.user.id },
  });

  if (!parent) {
    throw new ApiError(404, 'Parent/Advisor profile not found.');
  }

  await prisma.studentParent.deleteMany({
    where: {
      studentId,
      parentId: parent.id,
    },
  });

  return res.status(200).json(new ApiResponse(200, null, 'Student unlinked successfully.'));
});

const getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const parent = await prisma.parentAdvisor.findUnique({
    where: { userId: req.user.id },
  });

  if (!parent) {
    throw new ApiError(404, 'Parent/Advisor profile not found.');
  }

  const link = await prisma.studentParent.findFirst({
    where: { studentId, parentId: parent.id },
  });

  if (!link) {
    throw new ApiError(403, 'You do not have access to this student\'s progress.');
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true, email: true } },
      applications: {
        include: { job: { include: { company: { select: { name: true } } } } },
        orderBy: { appliedAt: 'desc' },
      },
      resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
      driveRegistrations: {
        include: { drive: true },
        orderBy: { registeredAt: 'desc' },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  const progress = {
    profile: {
      name: student.user.name,
      email: student.user.email,
      college: student.college,
      branch: student.branch,
      cgpa: student.cgpa,
      batch: student.batch,
      skills: student.skills,
      isPlaced: student.isPlaced,
      placedCompany: student.placedCompany,
      placedPackage: student.placedPackage,
      placementReadiness: student.placementReadiness,
    },
    applicationStats: {
      total: student.applications.length,
      shortlisted: student.applications.filter(a => a.status === 'SHORTLISTED').length,
      interviews: student.applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      selected: student.applications.filter(a => a.status === 'SELECTED').length,
      rejected: student.applications.filter(a => a.status === 'REJECTED').length,
    },
    recentApplications: student.applications.slice(0, 10),
    latestResume: student.resumes[0],
    driveRegistrations: student.driveRegistrations,
  };

  return res.status(200).json(new ApiResponse(200, progress, 'Student progress retrieved.'));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const parent = await prisma.parentAdvisor.findUnique({
    where: { userId: req.user.id },
  });

  if (!parent) {
    throw new ApiError(404, 'Parent/Advisor profile not found.');
  }

  const links = await prisma.studentParent.findMany({
    where: { parentId: parent.id },
    include: { student: true },
  });

  const studentIds = links.map(l => l.studentId);

  const [totalApplications, placedStudents, totalStudents] = await Promise.all([
    prisma.application.count({ where: { studentId: { in: studentIds } } }),
    prisma.student.count({ where: { id: { in: studentIds }, isPlaced: true } }),
    prisma.student.count({ where: { id: { in: studentIds } } }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalStudents,
      totalApplications,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
      watchingStudents: links.map(l => ({
        id: l.student.id,
        name: l.student.user?.name,
        isPlaced: l.student.isPlaced,
        placementReadiness: l.student.placementReadiness,
      })),
    }, 'Dashboard stats retrieved.')
  );
});

const getParentDashboard = asyncHandler(async (req, res) => {
  const parent = await prisma.parentAdvisor.findUnique({
    where: { userId: req.user.id },
    include: {
      watchingStudents: {
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
              applications: {
                include: { job: { include: { company: { select: { name: true } } } } },
                orderBy: { appliedAt: 'desc' },
                take: 3,
              },
            },
          },
        },
      },
    },
  });

  if (!parent) {
    throw new ApiError(404, 'Parent/Advisor profile not found.');
  }

  const dashboard = {
    profile: {
      name: parent.user?.name,
      email: parent.user?.email,
      phone: parent.phone,
    },
    students: parent.watchingStudents.map(ws => ({
      id: ws.student.id,
      name: ws.student.user?.name,
      email: ws.student.user?.email,
      college: ws.student.college,
      branch: ws.student.branch,
      cgpa: ws.student.cgpa,
      isPlaced: ws.student.isPlaced,
      placedCompany: ws.student.placedCompany,
      placedPackage: ws.student.placedPackage,
      placementReadiness: ws.student.placementReadiness,
      relation: ws.relation,
      recentApplications: ws.student.applications,
    })),
  };

  return res.status(200).json(new ApiResponse(200, dashboard, 'Parent dashboard retrieved.'));
});

export {
  getParentProfile,
  linkStudent,
  unlinkStudent,
  getStudentProgress,
  getDashboardStats,
  getParentDashboard,
};
