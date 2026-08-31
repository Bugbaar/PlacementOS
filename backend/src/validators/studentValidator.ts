import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  branch: z.string().min(1, 'Branch is required'),
  college: z.string().min(1, 'College is required'),
  cgpa: z.number().min(0).max(10),
  graduationYear: z.number().int().min(2000).max(2100),
  skills: z.array(z.string()).optional(),
  preferredRoles: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

export const updateStudentSchema = createStudentSchema.partial();
