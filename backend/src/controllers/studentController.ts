import { Request, Response, NextFunction } from 'express';
import Student from '../models/Student';
import { sendSuccess, sendError } from '../utils/response';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = new Student(req.body);
    await student.save();
    sendSuccess(res, student, 201);
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
    sendSuccess(res, student);
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
    
    // Update fields
    Object.assign(student, req.body);
    await student.save();
    
    sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await Student.find();
    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};
