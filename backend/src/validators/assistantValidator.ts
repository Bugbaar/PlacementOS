import { z } from 'zod';

export const chatRequestSchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long (max 2000 chars)'),
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).max(20, 'Conversation history too long'),
});
