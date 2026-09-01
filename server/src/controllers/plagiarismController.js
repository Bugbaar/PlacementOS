import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
};

const createShingles = (tokens, k = 3) => {
  const shingles = new Set();
  for (let i = 0; i <= tokens.length - k; i++) {
    shingles.add(tokens.slice(i, i + k).join(' '));
  }
  return shingles;
};

const calculateJaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
};

const calculateCosineSimilarity = (textA, textB) => {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  
  const freqA = {};
  const freqB = {};
  
  tokensA.forEach(t => { freqA[t] = (freqA[t] || 0) + 1; });
  tokensB.forEach(t => { freqB[t] = (freqB[t] || 0) + 1; });
  
  const allTerms = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  
  for (const term of allTerms) {
    const a = freqA[term] || 0;
    const b = freqB[term] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }
  
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};

const checkPlagiarism = asyncHandler(async (req, res) => {
  const { resumeText } = req.body;
  
  if (!resumeText || resumeText.trim().length < 50) {
    throw new ApiError(400, 'Resume text must be at least 50 characters.');
  }
  
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
  });
  
  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }
  
  const otherResumes = await prisma.resume.findMany({
    where: {
      studentId: { not: student.id },
      feedback: { not: null },
    },
    include: { student: { include: { user: { select: { name: true } } } } },
    take: 100,
  });
  
  const inputTokens = tokenize(resumeText);
  const inputShingles = createShingles(inputTokens);
  
  const matches = [];
  
  for (const resume of otherResumes) {
    if (!resume.feedback) continue;
    
    try {
      const feedback = JSON.parse(resume.feedback);
      const compareText = feedback.summary || '';
      
      const compareTokens = tokenize(compareText);
      const compareShingles = createShingles(compareTokens);
      
      const jaccardScore = calculateJaccardSimilarity(inputShingles, compareShingles);
      const cosineScore = calculateCosineSimilarity(resumeText, compareText);
      
      const combinedScore = (jaccardScore * 0.4 + cosineScore * 0.6);
      
      if (combinedScore > 0.3) {
        matches.push({
          resumeId: resume.id,
          studentName: resume.student.user.name,
          similarity: parseFloat((combinedScore * 100).toFixed(1)),
          method: combinedScore > 0.5 ? 'high' : 'moderate',
        });
      }
    } catch (err) {
      continue;
    }
  }
  
  matches.sort((a, b) => b.similarity - a.similarity);
  
  const avgSimilarity = matches.length > 0 
    ? matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length 
    : 0;
  
  const uniquenessScore = Math.max(0, 100 - avgSimilarity);
  
  const result = {
    uniquenessScore: parseFloat(uniquenessScore.toFixed(1)),
    originalityRating: uniquenessScore >= 80 ? 'High' : uniquenessScore >= 50 ? 'Moderate' : 'Low',
    matches: matches.slice(0, 5),
    totalCompared: otherResumes.length,
    suggestions: uniquenessScore < 70 ? [
      'Use more personal language and experiences',
      'Avoid copying common phrases and templates',
      'Add specific details from your own projects',
      'Write in your own voice and style',
    ] : ['Your resume appears to be original. Good job!'],
  };
  
  return res.status(200).json(new ApiResponse(200, result, 'Plagiarism check completed'));
});

const getPlagiarismStats = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    include: { resumes: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });
  
  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }
  
  const stats = {
    totalResumes: student.resumes.length,
    averageUniqueness: student.resumes.length > 0 
      ? student.resumes.reduce((sum, r) => {
          try {
            const feedback = JSON.parse(r.feedback || '{}');
            return sum + (feedback.uniquenessScore || 85);
          } catch {
            return sum + 85;
          }
        }, 0) / student.resumes.length 
      : 0,
    latestCheck: student.resumes[0]?.analyzedAt || null,
  };
  
  return res.status(200).json(new ApiResponse(200, stats, 'Plagiarism stats retrieved'));
});

export { checkPlagiarism, getPlagiarismStats, calculateJaccardSimilarity, calculateCosineSimilarity };
