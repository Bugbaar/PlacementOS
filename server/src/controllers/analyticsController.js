import prisma from '../config/database.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getOverview = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    placedStudents,
    totalCompanies,
    activeJobs,
    totalApplications,
    totalDrives,
    recentApplications,
    drivesByStatus,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isPlaced: true } }),
    prisma.company.count(),
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.application.count(),
    prisma.placementDrive.count(),
    prisma.application.findMany({
      take: 8,
      orderBy: { appliedAt: 'desc' },
      include: {
        student: { include: { user: { select: { name: true, email: true, avatar: true } } } },
        job: { include: { company: { select: { name: true, logo: true } } } },
      },
    }),
    prisma.placementDrive.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalStudents,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        placementRate: `${placementRate}%`,
        totalCompanies,
        activeJobs,
        totalApplications,
        totalDrives,
        recentApplications,
        drivesByStatus,
      },
      'Placement overview retrieved.'
    )
  );
});

const getBranchStats = asyncHandler(async (req, res) => {
  const students = await prisma.student.findMany({
    select: { branch: true, isPlaced: true, cgpa: true, placedCompany: true, placedPackage: true },
  });

  const branchMap = {};
  students.forEach((s) => {
    const b = s.branch || 'General';
    if (!branchMap[b]) {
      branchMap[b] = { total: 0, placed: 0, avgCgpa: 0, cgpaSum: 0, placedList: [] };
    }
    branchMap[b].total += 1;
    if (s.isPlaced) {
      branchMap[b].placed += 1;
      if (s.placedPackage) branchMap[b].placedList.push(s.placedPackage);
    }
    if (s.cgpa) branchMap[b].cgpaSum += s.cgpa;
  });

  const branchStats = Object.keys(branchMap).map((branch) => {
    const item = branchMap[branch];
    return {
      branch,
      totalStudents: item.total,
      placedStudents: item.placed,
      placementRate: item.total > 0 ? ((item.placed / item.total) * 100).toFixed(1) : 0,
      avgCgpa: item.total > 0 ? (item.cgpaSum / item.total).toFixed(2) : 0,
    };
  });

  return res.status(200).json(new ApiResponse(200, branchStats, 'Branch analytics retrieved.'));
});

const getSalaryAnalytics = asyncHandler(async (req, res) => {
  const placedStudents = await prisma.student.findMany({
    where: { isPlaced: true, placedPackage: { not: null } },
    select: { placedPackage: true, placedCompany: true, branch: true },
  });

  
  const parseLPA = (pkg) => {
    if (!pkg) return 0;
    const match = pkg.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const packages = placedStudents
    .map(s => parseLPA(s.placedPackage))
    .filter(p => p > 0)
    .sort((a, b) => a - b);

  const highest = packages.length ? packages[packages.length - 1] : 0;
  const average = packages.length
    ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1)
    : 0;
  const median = packages.length
    ? packages[Math.floor(packages.length / 2)]
    : 0;

  const tierBreakdown = {
    superDream: { label: 'Super Dream (> ₹20 LPA)', count: packages.filter(p => p > 20).length },
    dream: { label: 'Dream (₹10 - 20 LPA)', count: packages.filter(p => p > 10 && p <= 20).length },
    core: { label: 'Standard (₹5 - 10 LPA)', count: packages.filter(p => p <= 10).length },
  };

  
  const recruiterMap = {};
  placedStudents.forEach(s => {
    if (!s.placedCompany) return;
    recruiterMap[s.placedCompany] = (recruiterMap[s.placedCompany] || 0) + 1;
  });
  const topRecruiters = Object.entries(recruiterMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([company, offers]) => ({ company, offers }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        highestPackage: `₹${highest} LPA`,
        averagePackage: `₹${average} LPA`,
        medianPackage: `₹${median} LPA`,
        tierBreakdown,
        topRecruiters,
        placedCount: placedStudents.length,
      },
      'Salary analytics retrieved.'
    )
  );
});

export { getOverview, getBranchStats, getSalaryAnalytics };
