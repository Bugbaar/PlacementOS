import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getCollaborativeRecommendations = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    include: {
      applications: {
        include: { job: true },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }

  const myJobIds = student.applications.map(a => a.jobId);
  const mySkills = (student.skills || []).map(s => s.toLowerCase());

  const similarStudents = await prisma.student.findMany({
    where: {
      id: { not: student.id },
      applications: {
        some: {
          jobId: { in: myJobIds },
        },
      },
    },
    include: {
      applications: {
        include: { job: { include: { company: true } } },
      },
    },
    take: 50,
  });

  const jobScores = new Map();

  for (const other of similarStudents) {
    const similarity = calculateSimilarity(mySkills, (other.skills || []).map(s => s.toLowerCase()));
    
    for (const app of other.applications) {
      if (myJobIds.includes(app.jobId)) continue;
      
      const currentScore = jobScores.get(app.jobId) || {
        job: app.job,
        score: 0,
        count: 0,
        reasons: [],
      };
      
      currentScore.score += similarity;
      currentScore.count += 1;
      currentScore.reasons.push(`Applied by similar student (${(similarity * 100).toFixed(0)}% match)`);
      
      jobScores.set(app.jobId, currentScore);
    }
  }

  const contentBasedJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: myJobIds },
      OR: [
        { skills: { hasSome: mySkills } },
        { allowedBranches: student.branch ? { has: student.branch } : undefined },
      ],
    },
    include: { company: true },
    take: 20,
  });

  for (const job of contentBasedJobs) {
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    const skillMatch = mySkills.filter(s => jobSkills.includes(s)).length;
    const contentScore = skillMatch / Math.max(jobSkills.length, 1);
    
    if (jobScores.has(job.id)) {
      const existing = jobScores.get(job.id);
      existing.score += contentScore * 0.5;
      existing.reasons.push(`Matches ${skillMatch} of your skills`);
    } else {
      jobScores.set(job.id, {
        job,
        score: contentScore * 0.5,
        count: 1,
        reasons: [`Matches ${skillMatch} of your skills`],
      });
    }
  }

  const recommendations = Array.from(jobScores.values())
    .map(item => ({
      ...item.job,
      recommendationScore: Math.min(99, Math.round((item.score / item.count) * 100)),
      matchReasons: item.reasons.slice(0, 3),
      basedOn: 'collaborative_filtering',
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10);

  return res.status(200).json(
    new ApiResponse(200, recommendations, 'Collaborative job recommendations')
  );
});

const calculateSimilarity = (skillsA, skillsB) => {
  if (skillsA.length === 0 || skillsB.length === 0) return 0;
  
  const setA = new Set(skillsA);
  const setB = new Set(skillsB);
  
  const intersection = [...setA].filter(s => setB.has(s)).length;
  const union = new Set([...setA, ...setB]).size;
  
  return union === 0 ? 0 : intersection / union;
};

const getTrendingJobs = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendingJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      applications: {
        some: {
          appliedAt: { gte: thirtyDaysAgo },
        },
      },
    },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
    orderBy: {
      applications: { _count: 'desc' },
    },
    take: 10,
  });

  return res.status(200).json(
    new ApiResponse(200, trendingJobs, 'Trending jobs based on recent applications')
  );
});

export { getCollaborativeRecommendations, getTrendingJobs };
