import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthUser } from '../types/auth';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const user: AuthUser = verifyToken(token);
    req.user = user;
    next();
  } catch {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }
  if (req.user.role !== 'admin') {
    return sendError(res, 'FORBIDDEN', 'Admin access required', 403);
  }
  next();
};

export const requireRecruiter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }
  if (req.user.role !== 'recruiter') {
    return sendError(res, 'FORBIDDEN', 'Recruiter access required', 403);
  }
  next();
};

/** Allow access when the authenticated user owns the resource or is an admin. */
export const requireSelfOrAdmin = (paramName = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    if (req.user.role === 'admin' || req.user.id === req.params[paramName]) {
      return next();
    }
    return sendError(res, 'FORBIDDEN', 'You can only access your own data', 403);
  };
};
