import fs from 'fs';
import prisma from '../config/database.js';
import geminiService from '../services/geminiService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addResumeAnalysisJob } from '../queue/resumeQueue.js';

const analyzeResume = asyncHandler(async (req, res) => {
  let { resumeText, targetRole, fileName } = req.body;

  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    throw new ApiError(400, 'Student profile not found.');
  }

  let fileUrl = 'inline-text-submission';

   if (req.file) {
     fileName = req.file.originalname;
     
     const { uploadBuffer } = await import('../services/cloudinaryService.js');
     const result = await uploadBuffer(req.file.buffer, 'resumes');
     fileUrl = result.secure_url;

    if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
      try {
        const fileContent = req.file.buffer.toString('utf8');
        if (fileContent && fileContent.trim().length > 20) {
          resumeText = fileContent;
        }
      } catch (err) {
        console.warn('Could not read uploaded text file directly:', err.message);
      }
    }
  }

  if (!resumeText || resumeText.trim().length < 20) {
    if (req.file) {
      resumeText = `Candidate Resume for ${student.user?.name || 'Applicant'} (${req.file.originalname}). Skills: ${(student.skills || []).join(', ') || 'Software Development, Problem Solving'}. Branch: ${student.branch || 'Engineering'}, CGPA: ${student.cgpa || 'N/A'}.`;
    } else {
      throw new ApiError(400, 'Please provide valid resume text or upload a resume file (minimum 20 characters).');
    }
  }

  addResumeAnalysisJob({ resumeText, targetRole, userId: req.user.id });

  const analysis = await geminiService.analyzeResume(resumeText, targetRole || 'Software Engineer');

  const savedResume = await prisma.resume.create({
    data: {
      studentId: student.id,
      fileUrl,
      fileName: fileName || 'Resume_Submission.pdf',
      atsScore: analysis.atsScore,
      targetRole: targetRole || 'Software Engineer',
      feedback: JSON.stringify({
        summary: analysis.summary,
        missingKeywords: analysis.missingKeywords,
      }),
      parsedSkills: analysis.parsedSkills || [],
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      analyzedAt: new Date(),
    },
  });

  if ((!student.skills || student.skills.length === 0) && analysis.parsedSkills?.length > 0) {
    await prisma.student.update({
      where: { id: student.id },
      data: { skills: analysis.parsedSkills },
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: savedResume.id,
        fileName: savedResume.fileName,
        fileUrl: savedResume.fileUrl,
        atsScore: analysis.atsScore,
        parsedSkills: analysis.parsedSkills,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        summary: analysis.summary,
        missingKeywords: analysis.missingKeywords,
        analyzedAt: savedResume.analyzedAt,
      },
      'Resume analyzed successfully.'
    )
  );
});

const getResumeHistory = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  const resumes = await prisma.resume.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return res.status(200).json(new ApiResponse(200, resumes, 'Resume history retrieved.'));
});

const getResumeById = asyncHandler(async (req, res) => {
  const resume = await prisma.resume.findUnique({
    where: { id: req.params.id },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!resume) {
    throw new ApiError(404, 'Resume analysis record not found.');
  }

  return res.status(200).json(new ApiResponse(200, resume, 'Resume analysis report retrieved.'));
});

export { analyzeResume, getResumeHistory, getResumeById };
