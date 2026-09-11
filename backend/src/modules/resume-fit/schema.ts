import { z } from 'zod';

/**
 * Structured shape we ask the LLM to extract from raw resume / JD text.
 * Keeping this narrow (skills + bullets only) on purpose: it's the
 * minimum needed for skill-matching and bullet retrieval, and a small
 * schema is far more reliable to get valid JSON back for on the first try.
 */
export const ExtractedProfileSchema = z.object({
  skills: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

export type ExtractedProfile = z.infer<typeof ExtractedProfileSchema>;

export const ResumeFitRequestSchema = z.object({
  jobDescription: z.string().min(20, 'jobDescription must be at least 20 characters'),
});

export interface SkillMatchResult {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

export interface BulletMatch {
  bullet: string;
  score: number;
}

export interface ResumeFitResponse {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  topRelevantBullets: BulletMatch[];
  extractedResumeSkillCount: number;
  extractedJdSkillCount: number;
}
