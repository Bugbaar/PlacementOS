"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkillRecommendations = exports.getOpportunityExplanation = exports.getCareerAdvice = void 0;
const Student_1 = __importDefault(require("../models/Student"));
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const aiService_1 = require("../services/aiService");
const response_1 = require("../utils/response");
const getCareerAdvice = async (req, res, next) => {
    try {
        const student = await Student_1.default.findById(req.params.studentId);
        if (!student)
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        const advice = (0, aiService_1.generateCareerAdvice)(student);
        (0, response_1.sendSuccess)(res, { advice });
    }
    catch (error) {
        next(error);
    }
};
exports.getCareerAdvice = getCareerAdvice;
const getOpportunityExplanation = async (req, res, next) => {
    try {
        const { studentId, opportunityId } = req.params;
        const student = await Student_1.default.findById(studentId);
        if (!student)
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        const opportunity = await Opportunity_1.default.findById(opportunityId);
        if (!opportunity)
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Opportunity not found', 404);
        const explanation = (0, aiService_1.generateOpportunityExplanation)(student, opportunity);
        (0, response_1.sendSuccess)(res, { explanation });
    }
    catch (error) {
        next(error);
    }
};
exports.getOpportunityExplanation = getOpportunityExplanation;
const getSkillRecommendations = async (req, res, next) => {
    try {
        const student = await Student_1.default.findById(req.params.studentId);
        if (!student)
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        const skills = (0, aiService_1.generateSkillRecommendations)(student);
        (0, response_1.sendSuccess)(res, { skills });
    }
    catch (error) {
        next(error);
    }
};
exports.getSkillRecommendations = getSkillRecommendations;
