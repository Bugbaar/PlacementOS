import { Request, Response, NextFunction } from 'express';
import Opportunity from '../models/Opportunity';
import { sendSuccess, sendError } from '../utils/response';

export const createOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opportunity = new Opportunity(req.body);
    await opportunity.save();
    sendSuccess(res, opportunity, 201);
  } catch (error) {
    next(error);
  }
};

export const getOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    sendSuccess(res, opportunities);
  } catch (error) {
    next(error);
  }
};

export const getOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    }
    sendSuccess(res, opportunity);
  } catch (error) {
    next(error);
  }
};

export const updateOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    }

    Object.assign(opportunity, req.body);
    await opportunity.save();

    sendSuccess(res, opportunity);
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    }
    sendSuccess(res, { message: 'Opportunity deleted successfully' });
  } catch (error) {
    next(error);
  }
};
