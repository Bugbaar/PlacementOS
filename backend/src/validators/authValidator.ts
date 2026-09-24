import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address').transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  phone: z.string().max(30).optional(),
  branch: z.string().min(1, 'Branch is required').max(120),
  college: z.string().min(1, 'College is required').max(200),
  cgpa: z.number().min(0).max(10),
  graduationYear: z.number().int().min(2000).max(2100),
  skills: z.array(z.string().max(64)).max(50).optional(),
  preferredRoles: z.array(z.string().max(64)).max(20).optional(),
  preferredLocations: z.array(z.string().max(64)).max(20).optional(),
  experienceLevel: z.string().max(64).optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(2000).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(128),
});
