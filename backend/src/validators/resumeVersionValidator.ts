import { z } from 'zod';

export const createResumeVersionSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  fileUrl: z.string().trim().min(1, 'fileUrl is required'),
});
