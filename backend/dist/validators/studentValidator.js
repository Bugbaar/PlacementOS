"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().optional(),
    branch: zod_1.z.string().min(1, 'Branch is required'),
    college: zod_1.z.string().min(1, 'College is required'),
    cgpa: zod_1.z.number().min(0).max(10),
    graduationYear: zod_1.z.number().int().min(2000).max(2100),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    preferredRoles: zod_1.z.array(zod_1.z.string()).optional(),
    preferredLocations: zod_1.z.array(zod_1.z.string()).optional(),
    experienceLevel: zod_1.z.string().optional(),
    resumeUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    bio: zod_1.z.string().optional(),
    githubUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    linkedinUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    portfolioUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
});
exports.updateStudentSchema = exports.createStudentSchema.partial();
