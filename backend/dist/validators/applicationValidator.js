"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationSchema = exports.createApplicationSchema = void 0;
const zod_1 = require("zod");
exports.createApplicationSchema = zod_1.z.object({
    studentId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    opportunityId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid opportunity ID'),
    status: zod_1.z.enum(['saved', 'applied', 'shortlisted', 'interview', 'rejected', 'offered', 'accepted']).optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateApplicationSchema = zod_1.z.object({
    status: zod_1.z.enum(['saved', 'applied', 'shortlisted', 'interview', 'rejected', 'offered', 'accepted']).optional(),
    notes: zod_1.z.string().optional(),
});
