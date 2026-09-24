import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Student from '../models/Student';
import { sendSuccess, sendError } from '../utils/response';
import { signToken } from '../utils/jwt';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

function toPublicStudent(student: InstanceType<typeof Student>) {
  const obj = student.toObject();
  // Never return credential material
  delete (obj as { passwordHash?: string }).passwordHash;
  return obj;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ignore any client-supplied role — registration is always student
    const { password, role: _role, passwordHash: _ph, ...profile } = req.body;
    const email = normalizeEmail(profile.email);

    const existing = await Student.findOne({ email });
    if (existing) {
      return sendError(res, 'DUPLICATE_EMAIL', 'Email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const student = new Student({
      ...profile,
      email,
      passwordHash,
      role: 'student',
    });
    await student.save();

    const token = signToken({
      id: student.id,
      role: student.role,
      email: student.email,
    });

    logger.info('Student registered', { studentId: student.id });
    sendSuccess(res, { token, student: toPublicStudent(student) }, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'DUPLICATE_EMAIL', 'Email already exists', 409);
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const student = await Student.findOne({ email }).select('+passwordHash');
    // Constant-ish response: same message whether missing user or bad password
    if (!student?.passwordHash) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(password, student.passwordHash);
    if (!valid) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const token = signToken({
      id: student.id,
      role: student.role,
      email: student.email,
    });

    logger.info('Student login', { studentId: student.id });
    sendSuccess(res, { token, student: toPublicStudent(student) });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return sendError(res, 'NOT_FOUND', 'Student not found', 404);
    }

    sendSuccess(res, { student: toPublicStudent(student) });
  } catch (error) {
    next(error);
  }
};
