import { z } from 'zod';

export const createOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  requiredSkills: z.array(z.string()).optional(),
  minimumCgpa: z.number().min(0).max(10).default(0),
  eligibleBranches: z.array(z.string()).optional(),
  eligibleGraduationYears: z.array(z.number().int()).optional(),
  location: z.string().min(1, 'Location is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  experienceLevel: z.string().optional(),
  salaryRange: z.string().optional(),
  applicationDeadline: z.string().datetime(), // ISO string
  status: z.enum(['active', 'closed', 'draft']).default('active'),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();
