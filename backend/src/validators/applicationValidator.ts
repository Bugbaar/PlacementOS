import { z } from 'zod';

export const createApplicationSchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  opportunityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid opportunity ID'),
  status: z.enum(['saved', 'applied', 'shortlisted', 'interview', 'rejected', 'offered', 'accepted']).optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['saved', 'applied', 'shortlisted', 'interview', 'rejected', 'offered', 'accepted']).optional(),
  notes: z.string().optional(),
});
