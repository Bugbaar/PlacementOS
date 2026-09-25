import { z } from 'zod';

export const createRecruiterOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  requiredSkills: z.array(z.string()).optional(),
  minimumCgpa: z.number().min(0).max(10).optional().default(0),
  eligibleBranches: z.array(z.string()).optional(),
  eligibleGraduationYears: z.array(z.number().int()).optional(),
  location: z.string().min(1).optional().default('Not specified'),
  employmentType: z.string().min(1).optional().default('Full-time'),
  experienceLevel: z.string().optional(),
  salaryRange: z.string().optional(),
  // Accept full ISO datetime or date-only (YYYY-MM-DD)
  applicationDeadline: z.string().min(1, 'Deadline is required'),
  status: z.enum(['active', 'closed', 'draft']).optional().default('active'),
});

export const updateRecruiterOpportunitySchema = createRecruiterOpportunitySchema.partial();

export const updateApplicantStatusSchema = z.object({
  status: z.enum(['applied', 'shortlisted', 'interview', 'rejected', 'offered', 'accepted']),
});
