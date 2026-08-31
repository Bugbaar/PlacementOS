import { generateAIResponse } from './groqService';
import Student, { IStudent } from '../models/Student';
import Opportunity, { IOpportunity } from '../models/Opportunity';
import Application from '../models/Application';
import { calculateMatchScore } from './matchingService';

export const getStudentContext = async (studentId: string) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  const opportunities = await Opportunity.find({ status: 'active' });
  const applications = await Application.find({ studentId }).populate('opportunityId', 'title company');

  // Generate recommendations and match scores deterministically
  const recommendations = opportunities.map((opp) => {
    const match = calculateMatchScore(student, opp);
    return {
      title: opp.title,
      company: opp.company,
      location: opp.location,
      employmentType: opp.employmentType,
      matchScore: match.matchScore,
      eligible: match.eligible,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5); // Top 5

  // Calculate deterministic readiness score
  let score = 50;
  if (student.cgpa >= 8) score += 15;
  if (student.skills.length >= 5) score += 15;
  if (student.preferredRoles.length > 0) score += 10;
  if (student.resumeUrl) score += 10;
  const readinessScore = Math.min(score, 100);

  return {
    student: {
      name: student.name,
      branch: student.branch,
      college: student.college,
      cgpa: student.cgpa,
      graduationYear: student.graduationYear,
      skills: student.skills,
      preferredRoles: student.preferredRoles,
      preferredLocations: student.preferredLocations,
    },
    readinessScore,
    recommendations,
    applications: applications.map((app: any) => ({
      title: app.opportunityId?.title,
      company: app.opportunityId?.company,
      status: app.status,
    })),
  };
};

const buildSystemPrompt = (context: any): string => {
  return `You are the "PlacementOS AI Placement Assistant", an intelligent university placement and career advisor.
Your goal is to provide personalized, actionable, and accurate advice to the student based on their actual PlacementOS data.

STUDENT CONTEXT:
${JSON.stringify(context, null, 2)}

IMPORTANT RULES:
1. USE ONLY THE DATA PROVIDED ABOVE. Never invent student information, CGPA, skills, or opportunities.
2. If you need information that is not in the context, clearly state that you do not have enough information in their PlacementOS profile.
3. ELIGIBILITY & MATCH SCORES ARE DETERMINISTIC: The context already provides the exact match score (out of 100) and eligibility status. DO NOT calculate your own eligibility. Instead, EXPLAIN WHY they match based on the provided matching and missing skills.
4. Distinguish facts (eligibility/scores) from your recommendations (how to prepare, what to learn).
5. Output your response in clean Markdown. Use headings, bullet points, and bold text for readability. Avoid huge walls of text. Be concise but useful.
6. When recommending learning paths or interview prep, explain WHY specific skills matter for their target roles or missing skills in top opportunities.
7. If the user asks about an opportunity, refer to the 'recommendations' array in the context.

You must behave as a friendly, professional, and highly contextual coach.`;
};

export const chatWithAssistant = async (studentId: string, userMessage: string, conversationHistory: any[]) => {
  const context = await getStudentContext(studentId);
  const systemPrompt = buildSystemPrompt(context);
  
  // Clean history (only role and content)
  const cleanHistory = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  // Prevent sending massive history
  const recentHistory = cleanHistory.slice(-10);

  try {
    const aiResponse = await generateAIResponse(systemPrompt, userMessage, recentHistory);
    return aiResponse;
  } catch (error) {
    throw error; // Rethrow to be caught by controller (handles fallback vs real error)
  }
};
