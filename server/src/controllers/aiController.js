import prisma from '../config/database.js';
import geminiService from '../services/geminiService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'A non-empty array of messages is required.');
  }

  let userContext = { name: req.user.name };
  if (req.user.role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (student) {
      userContext = {
        name: req.user.name,
        college: student.college,
        branch: student.branch,
        cgpa: student.cgpa,
        skills: student.skills,
      };
    }
  }

  const reply = await geminiService.chatAssistant(messages, userContext);
  return res.status(200).json(new ApiResponse(200, { role: 'assistant', content: reply }, 'AI Coach response.'));
});

const getMockInterviewQuestions = asyncHandler(async (req, res) => {
  const { companyName, roleTitle, level } = req.body;

  const prompt = `Generate a realistic 5-question technical & behavioral campus placement interview question set for a candidate applying to "${companyName || 'Tech Startup'}" for the role "${roleTitle || 'Full Stack Engineer'}" (${level || 'Fresher/Campus'}).
For each question, provide:
1. Question text
2. Ideal evaluation answer guideline
3. Relevant tech topic or competency.

Format cleanly with clear headings and bullet points.`;

  const response = await geminiService.generateContent(
    prompt,
    'You are an expert technical hiring manager creating campus placement interview questions.'
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        companyName,
        roleTitle,
        content:
          response ||
          `###  Placement Interview Prep for ${roleTitle} at ${companyName}\n1. **Explain the Virtual DOM & Reconciliation in React.** (React & Architecture)\n2. **How does indexing work in PostgreSQL and B-Trees?** (Databases)\n3. **Describe a time you solved a critical bug under pressure.** (STAR Behavioral)\n4. **Implement an LRU Cache with O(1) get and put.** (DSA)\n5. **How would you scale a campus placement portal during high traffic?** (System Design)`,
      },
      'Mock interview questions generated.'
    )
  );
});

const getPlacementReadiness = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    include: {
      resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
      applications: true,
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }

  let score = 50;
  const breakdown = {};

  if (student.cgpa) {
    const cgpaScore = Math.min(25, Math.round((student.cgpa / 10) * 25));
    score += cgpaScore - 12;
    breakdown.academics = `${cgpaScore}/25 (${student.cgpa} CGPA)`;
  } else {
    breakdown.academics = '12/25 (CGPA not provided)';
  }

  const skillCount = (student.skills || []).length;
  const skillScore = Math.min(25, skillCount * 4);
  score += skillScore - 12;
  breakdown.skills = `${skillScore}/25 (${skillCount} skills verified)`;

  const latestResume = student.resumes[0];
  const atsScore = latestResume?.atsScore || 65;
  const resumeScore = Math.round((atsScore / 100) * 30);
  score += resumeScore - 15;
  breakdown.resumeAts = `${resumeScore}/30 (ATS score: ${atsScore})`;

  let profilePts = 5;
  if (student.github) profilePts += 5;
  if (student.linkedin) profilePts += 5;
  if (student.portfolio) profilePts += 5;
  score += profilePts - 10;
  breakdown.portfolio = `${profilePts}/20 (Links & portfolio)`;

  score = Math.max(35, Math.min(98, Math.round(score)));

  await prisma.student.update({
    where: { id: student.id },
    data: { placementReadiness: score },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        readinessScore: score,
        level: score >= 80 ? 'Placement Ready' : score >= 60 ? 'Competitive' : 'Needs Preparation',
        breakdown,
        recommendations: [
          'Practice top 20 High-Frequency LeetCode Tree & Graph problems.',
          'Add quantitative impact metrics to your primary full-stack project.',
          'Attend upcoming mock interviews to boost behavioral communication.',
        ],
      },
      'Placement Readiness score calculated.'
    )
  );
});




const getRecommendedJobs = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }

  const studentSkills = (student.skills || []).map((s) => s.toLowerCase());

  const activeJobs = await prisma.job.findMany({
    where: { status: 'ACTIVE' },
    include: { company: { select: { id: true, name: true, logo: true, location: true } } },
  });

  const scoredJobs = activeJobs.map((job) => {
    let matchCount = 0;
    (job.skills || []).forEach((js) => {
      if (studentSkills.includes(js.toLowerCase())) {
        matchCount += 1;
      }
    });

    const totalJobSkills = (job.skills || []).length || 1;
    const matchPercentage = Math.round((matchCount / totalJobSkills) * 100);
    const isEligible = !job.minCgpa || !student.cgpa || student.cgpa >= job.minCgpa;

    return {
      ...job,
      matchPercentage: Math.max(30, Math.min(99, matchPercentage)),
      matchedSkillsCount: matchCount,
      isEligible,
    };
  });

  scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return res.status(200).json(new ApiResponse(200, scoredJobs.slice(0, 8), 'Recommended jobs retrieved.'));
});

export { chat, getMockInterviewQuestions, getPlacementReadiness, getRecommendedJobs };
