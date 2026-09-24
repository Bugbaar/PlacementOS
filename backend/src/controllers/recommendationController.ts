import { Request, Response, NextFunction } from 'express';
import Student from '../models/Student';
import { getRecommendations } from '../services/recommendationService';
import { sendSuccess, sendError } from '../utils/response';

export const getStudentRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return sendError(res, 'NOT_FOUND', 'Student not found', 404);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const minScore = parseInt(req.query.minScore as string) || 0;

    const recommendations = await getRecommendations(student, page, limit, minScore);

    sendSuccess(res, recommendations);
  } catch (error) {
    next(error);
  }
};
