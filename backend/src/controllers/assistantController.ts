import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { chatWithAssistant } from '../services/placementAssistantService';

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, message, conversation } = req.body;

    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return sendError(res, 'FORBIDDEN', 'You can only chat as yourself', 403);
    }

    // Fallback handling happens if API key is missing (handled inside groqService or caught here)
    const aiResponse = await chatWithAssistant(studentId, message, conversation);

    sendSuccess(res, {
      message: aiResponse,
      model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
      provider: 'groq'
    });
  } catch (error: any) {
    if (error.message?.includes('missing GROQ_API_KEY')) {
      sendSuccess(res, {
        message: "⚠️ **AI Service is not configured.**\n\nThe `GROQ_API_KEY` is missing on the server. I am running in fallback mode and cannot process this query. The deterministic placement features still work perfectly!",
        model: 'fallback',
        provider: 'none'
      });
    } else {
      next(error);
    }
  }
};
