import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Student from '../models/Student';
import { sendSuccess, sendError } from '../utils/response';

const SALT_ROUNDS = 12;

function toPublicStudent(student: InstanceType<typeof Student>) {
  const obj = student.toObject();
  delete (obj as { passwordHash?: string }).passwordHash;
  return obj;
}

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, ...profile } = req.body;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const student = new Student({
      ...profile,
      email: String(profile.email).trim().toLowerCase(),
      passwordHash,
      role: profile.role === 'admin' ? 'admin' : 'student',
    });
    await student.save();
    sendSuccess(res, toPublicStudent(student), 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'DUPLICATE_EMAIL', 'Email already exists', 409);
    }
    next(error);
  }
};

export const getStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendError(res, 'NOT_FOUND', 'Student not found', 404);
    }
    sendSuccess(res, toPublicStudent(student));
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendError(res, 'NOT_FOUND', 'Student not found', 404);
    }

    // Never allow privilege escalation or password overwrite via this endpoint
    const { password: _password, passwordHash: _passwordHash, role: _role, ...safeUpdates } = req.body;
    Object.assign(student, safeUpdates);
    await student.save();

    sendSuccess(res, toPublicStudent(student));
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await Student.find();
    sendSuccess(res, students.map((s) => toPublicStudent(s)));
  } catch (error) {
    next(error);
  }
};
