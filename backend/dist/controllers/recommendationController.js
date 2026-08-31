"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentRecommendations = void 0;
const Student_1 = __importDefault(require("../models/Student"));
const recommendationService_1 = require("../services/recommendationService");
const response_1 = require("../utils/response");
const getStudentRecommendations = async (req, res, next) => {
    try {
        const student = await Student_1.default.findById(req.params.studentId);
        if (!student) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const minScore = parseInt(req.query.minScore) || 0;
        const recommendations = await (0, recommendationService_1.getRecommendations)(student, page, limit, minScore);
        (0, response_1.sendSuccess)(res, recommendations);
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentRecommendations = getStudentRecommendations;
