"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudents = exports.updateStudent = exports.getStudent = exports.createStudent = void 0;
const Student_1 = __importDefault(require("../models/Student"));
const response_1 = require("../utils/response");
const createStudent = async (req, res, next) => {
    try {
        const student = new Student_1.default(req.body);
        await student.save();
        (0, response_1.sendSuccess)(res, student, 201);
    }
    catch (error) {
        if (error.code === 11000) {
            return (0, response_1.sendError)(res, 'DUPLICATE_EMAIL', 'Email already exists', 409);
        }
        next(error);
    }
};
exports.createStudent = createStudent;
const getStudent = async (req, res, next) => {
    try {
        const student = await Student_1.default.findById(req.params.id);
        if (!student) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        }
        (0, response_1.sendSuccess)(res, student);
    }
    catch (error) {
        next(error);
    }
};
exports.getStudent = getStudent;
const updateStudent = async (req, res, next) => {
    try {
        const student = await Student_1.default.findById(req.params.id);
        if (!student) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Student not found', 404);
        }
        // Update fields
        Object.assign(student, req.body);
        await student.save();
        (0, response_1.sendSuccess)(res, student);
    }
    catch (error) {
        next(error);
    }
};
exports.updateStudent = updateStudent;
const getStudents = async (req, res, next) => {
    try {
        const students = await Student_1.default.find();
        (0, response_1.sendSuccess)(res, students);
    }
    catch (error) {
        next(error);
    }
};
exports.getStudents = getStudents;
