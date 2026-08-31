"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplication = exports.getStudentApplications = exports.createApplication = void 0;
const Application_1 = __importDefault(require("../models/Application"));
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const Student_1 = __importDefault(require("../models/Student"));
const response_1 = require("../utils/response");
const createApplication = async (req, res, next) => {
    try {
        const { studentId, opportunityId, status, notes } = req.body;
        const student = await Student_1.default.findById(studentId);
        if (!student)
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        const opportunity = await Opportunity_1.default.findById(opportunityId);
        if (!opportunity)
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Opportunity not found', 404);
        const application = new Application_1.default({
            studentId,
            opportunityId,
            status: status || 'applied',
            notes,
        });
        await application.save();
        // Populate opportunity for frontend convenience
        await application.populate('opportunityId');
        (0, response_1.sendSuccess)(res, application, 201);
    }
    catch (error) {
        if (error.code === 11000) {
            return (0, response_1.sendError)(res, 'DUPLICATE_APPLICATION', 'You have already applied or saved this opportunity', 409);
        }
        next(error);
    }
};
exports.createApplication = createApplication;
const getStudentApplications = async (req, res, next) => {
    try {
        const applications = await Application_1.default.find({ studentId: req.params.studentId })
            .populate('opportunityId')
            .sort({ updatedAt: -1 });
        (0, response_1.sendSuccess)(res, applications);
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentApplications = getStudentApplications;
const updateApplication = async (req, res, next) => {
    try {
        const application = await Application_1.default.findById(req.params.id);
        if (!application) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Application not found', 404);
        }
        if (req.body.status)
            application.status = req.body.status;
        if (req.body.notes !== undefined)
            application.notes = req.body.notes;
        application.updatedAt = new Date();
        await application.save();
        await application.populate('opportunityId');
        (0, response_1.sendSuccess)(res, application);
    }
    catch (error) {
        next(error);
    }
};
exports.updateApplication = updateApplication;
