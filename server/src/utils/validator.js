import Joi from 'joi';
import { CONFIG } from './constants.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(64).required(),
  role: Joi.string().valid('STUDENT', 'RECRUITER', 'PLACEMENT_CELL', 'ADMIN', 'PARENT_ADVISOR').default('STUDENT'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const jobCreateSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().min(10).required(),
  requirements: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  salary: Joi.string().optional(),
  location: Joi.string().optional(),
  type: Joi.string().valid('FULL_TIME', 'INTERNSHIP', 'CONTRACT', 'PART_TIME', 'REMOTE', 'HYBRID', 'GIG_WORK').default('FULL_TIME'),
  minCgpa: Joi.number().min(0).max(10).optional(),
  allowedBranches: Joi.array().items(Joi.string()).optional(),
  openPositions: Joi.number().integer().min(1).default(1),
  experience: Joi.string().optional(),
  deadline: Joi.date().iso().optional(),
});

const announcementCreateSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(5).required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  targetGroup: Joi.string().default('ALL'),
});

const driveCreateSchema = Joi.object({
  companyId: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().optional(),
  date: Joi.date().iso().required(),
  eligibility: Joi.string().optional(),
  minCgpa: Joi.number().min(0).max(10).optional(),
  allowedBranches: Joi.array().items(Joi.string()).optional(),
  rounds: Joi.array().items(Joi.string()).optional(),
  venue: Joi.string().optional(),
  coordinator: Joi.string().optional(),
  packageOffered: Joi.string().optional(),
});

const applicationStatusSchema = Joi.object({
  status: Joi.string().valid(
    'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
    'INTERVIEW_CLEARED', 'OFFER_EXTENDED', 'SELECTED', 'REJECTED', 'WITHDRAWN'
  ).required(),
  notes: Joi.string().optional(),
  interviewDate: Joi.date().iso().optional(),
  interviewLink: Joi.string().uri().optional(),
  interviewRound: Joi.string().optional(),
  offerLetterUrl: Joi.string().uri().optional(),
  offeredSalary: Joi.string().optional(),
});

const companyCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  logo: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  industry: Joi.string().optional(),
  description: Joi.string().optional(),
  location: Joi.string().optional(),
  size: Joi.string().optional(),
  foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
});

const companyUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  logo: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  industry: Joi.string().optional(),
  description: Joi.string().optional(),
  location: Joi.string().optional(),
  size: Joi.string().optional(),
  foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
});

const studentProfileUpdateSchema = Joi.object({
  college: Joi.string().optional(),
  branch: Joi.string().optional(),
  cgpa: Joi.number().min(0).max(10).optional(),
  batch: Joi.string().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  portfolio: Joi.string().uri().optional(),
  github: Joi.string().uri().optional(),
  linkedin: Joi.string().uri().optional(),
  phone: Joi.string().optional(),
  bio: Joi.string().optional(),
  location: Joi.string().optional(),
  name: Joi.string().min(2).max(100).optional(),
});

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(422).json({
      success: false,
      error: 'Validation Error',
      details: errorDetails,
    });
  }
  req.body = value;
  next();
};

export {
  registerSchema,
  loginSchema,
  jobCreateSchema,
  announcementCreateSchema,
  driveCreateSchema,
  applicationStatusSchema,
  companyCreateSchema,
  companyUpdateSchema,
  studentProfileUpdateSchema,
  validateBody,
};
