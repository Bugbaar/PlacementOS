"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOpportunitySchema = exports.createOpportunitySchema = void 0;
const zod_1 = require("zod");
exports.createOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    company: zod_1.z.string().min(1, 'Company is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    requiredSkills: zod_1.z.array(zod_1.z.string()).optional(),
    minimumCgpa: zod_1.z.number().min(0).max(10).default(0),
    eligibleBranches: zod_1.z.array(zod_1.z.string()).optional(),
    eligibleGraduationYears: zod_1.z.array(zod_1.z.number().int()).optional(),
    location: zod_1.z.string().min(1, 'Location is required'),
    employmentType: zod_1.z.string().min(1, 'Employment type is required'),
    experienceLevel: zod_1.z.string().optional(),
    salaryRange: zod_1.z.string().optional(),
    applicationDeadline: zod_1.z.string().datetime(), // ISO string
    status: zod_1.z.enum(['active', 'closed', 'draft']).default('active'),
});
exports.updateOpportunitySchema = exports.createOpportunitySchema.partial();
