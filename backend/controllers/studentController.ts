import { NextFunction, Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import Student, { IStudent, placementStatuses, PlacementStatus } from '../models/Student';

type StudentInput = {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  course?: string;
  graduationYear?: number;
  skills?: string[];
  placementStatus?: PlacementStatus;
};

type StudentFilters = {
  search?: string;
  college?: string;
  course?: string;
  placementStatus?: PlacementStatus;
  skill?: string;
};

type StudentQuery = Record<string, unknown>;

type ListOptions = {
  page: number;
  limit: number;
  filters: StudentFilters;
};

const allowedFields: (keyof StudentInput)[] = [
  'name',
  'email',
  'phone',
  'college',
  'course',
  'graduationYear',
  'skills',
  'placementStatus'
];

const getStudentData = (data: Record<string, unknown>): StudentInput => {
  const studentData: StudentInput = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      studentData[field] = data[field] as never;
    }
  });

  return studentData;
};

const validateStudentData = (data: StudentInput, isUpdate = false): string | null => {
  if (!isUpdate && (!data.name || !data.email)) {
    return 'Name and email are required';
  }

  if (
    data.skills !== undefined &&
    (!Array.isArray(data.skills) || !data.skills.every((skill) => typeof skill === 'string'))
  ) {
    return 'Skills must be an array of strings';
  }

  return null;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getTextQuery = (query: StudentQuery, field: string) => {
  const value = query[field];

  if (value === undefined) {
    return { value: undefined };
  }

  if (typeof value !== 'string') {
    return { error: `${field} must be a single text value` };
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { error: `${field} cannot be empty` };
  }

  if (trimmedValue.length > 100) {
    return { error: `${field} must be 100 characters or fewer` };
  }

  return { value: trimmedValue };
};

const getPositiveInteger = (value: unknown, field: string, defaultValue: number, max?: number) => {
  if (value === undefined) {
    return { value: defaultValue };
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return { error: `${field} must be a positive integer` };
  }

  const numberValue = Number(value);

  if (numberValue < 1 || (max && numberValue > max)) {
    return { error: max ? `${field} must be between 1 and ${max}` : `${field} must be at least 1` };
  }

  return { value: numberValue };
};

export const getListOptions = (
  query: StudentQuery
): { options: ListOptions } | { error: string } => {
  const pageResult = getPositiveInteger(query.page, 'page', 1);
  const limitResult = getPositiveInteger(query.limit, 'limit', 10, 100);

  if (pageResult.error || limitResult.error) {
    return { error: pageResult.error || limitResult.error || 'Invalid pagination values' };
  }

  const filters: StudentFilters = {};

  for (const field of ['search', 'college', 'course', 'placementStatus', 'skill']) {
    const result = getTextQuery(query, field);

    if (result.error) {
      return { error: result.error };
    }

    if (result.value) {
      if (field === 'placementStatus') {
        if (!placementStatuses.includes(result.value as PlacementStatus)) {
          return { error: `placementStatus must be one of: ${placementStatuses.join(', ')}` };
        }

        filters.placementStatus = result.value as PlacementStatus;
      } else {
        filters[field as keyof Omit<StudentFilters, 'placementStatus'>] = result.value;
      }
    }
  }

  return {
    options: {
      page: pageResult.value as number,
      limit: limitResult.value as number,
      filters
    }
  };
};

export const buildStudentFilter = (filters: StudentFilters): FilterQuery<IStudent> => {
  const filter: FilterQuery<IStudent> = {};

  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (filters.college) {
    filter.college = new RegExp(escapeRegex(filters.college), 'i');
  }

  if (filters.course) {
    filter.course = new RegExp(escapeRegex(filters.course), 'i');
  }

  if (filters.placementStatus) {
    filter.placementStatus = filters.placementStatus;
  }

  if (filters.skill) {
    filter.skills = new RegExp(escapeRegex(filters.skill), 'i');
  }

  return filter;
};

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentData = getStudentData(req.body || {});
    const validationError = validateStudentData(studentData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const student = await Student.create(studentData);
    return res.status(201).json(student);
  } catch (error) {
    return next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listOptions = getListOptions(req.query as StudentQuery);

    if ('error' in listOptions) {
      return res.status(400).json({ message: listOptions.error });
    }

    const { page, limit, filters } = listOptions.options;
    const skip = (page - 1) * limit;
    const studentFilter = buildStudentFilter(filters);

    const [students, total] = await Promise.all([
      Student.find(studentFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(studentFilter)
    ]);

    return res.status(200).json({
      students,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentData = getStudentData(req.body || {});

    if (Object.keys(studentData).length === 0) {
      return res.status(400).json({ message: 'Provide at least one valid field to update' });
    }

    const validationError = validateStudentData(studentData, true);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, studentData, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const handleStudentError = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if ((error as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'A student with this email already exists' });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  return next(error);
};
