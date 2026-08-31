"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRequestSchema = void 0;
const zod_1 = require("zod");
exports.chatRequestSchema = zod_1.z.object({
    studentId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
    message: zod_1.z.string().min(1, 'Message is required').max(2000, 'Message is too long (max 2000 chars)'),
    conversation: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string(),
    })).max(20, 'Conversation history too long'),
});
