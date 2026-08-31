import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { chatWithAssistant, getStudentContext } from '../services/placementAssistantService';

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, message, conversation } = req.body;
    
    // Fallback handling happens if API key is missing (handled inside groqService or caught here)
    const aiResponse = await chatWithAssistant(studentId, message, conversation);

    sendSuccess(res, {
      message: aiResponse,
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      provider: 'groq'
    });
  } catch (error: any) {
    if (error.message.includes('missing GROQ_API_KEY')) {
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

export const getInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    
    // Instead of calling the AI on every dashboard load (which is slow/expensive),
    // we use the fast deterministic context builder to pull top insights,
    // and if Groq is enabled, we could enrich it. For now, deterministic insights are great for the dashboard widget.
    const context = await getStudentContext(studentId);
    
    const insights = [];
    
    if (context.recommendations.length > 0) {
      const topMatch = context.recommendations[0];
      insights.push(`Your strongest opportunity is **${topMatch.title}** at ${topMatch.company} with a ${topMatch.matchScore}% match.`);
      
      const allMissingSkills = context.recommendations.flatMap(r => r.missingSkills);
      if (allMissingSkills.length > 0) {
        const mostNeeded = allMissingSkills.sort((a, b) => 
          allMissingSkills.filter(v => v === a).length - allMissingSkills.filter(v => v === b).length
        ).pop();
        if (mostNeeded) insights.push(`Adding **${mostNeeded}** to your skills could improve your fit for recommended opportunities.`);
      }
    }
    
    const activeApps = context.applications.filter(a => ['applied', 'interview', 'shortlisted'].includes(a.status));
    if (activeApps.length > 0) {
      insights.push(`You have ${activeApps.length} active applications that need follow-up.`);
    }

    sendSuccess(res, { insights });
  } catch (error) {
    next(error);
  }
};
