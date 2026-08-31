"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOpportunity = exports.updateOpportunity = exports.getOpportunity = exports.getOpportunities = exports.createOpportunity = void 0;
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const response_1 = require("../utils/response");
const createOpportunity = async (req, res, next) => {
    try {
        const opportunity = new Opportunity_1.default(req.body);
        await opportunity.save();
        (0, response_1.sendSuccess)(res, opportunity, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createOpportunity = createOpportunity;
const getOpportunities = async (req, res, next) => {
    try {
        const opportunities = await Opportunity_1.default.find().sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, opportunities);
    }
    catch (error) {
        next(error);
    }
};
exports.getOpportunities = getOpportunities;
const getOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity_1.default.findById(req.params.id);
        if (!opportunity) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Opportunity not found', 404);
        }
        (0, response_1.sendSuccess)(res, opportunity);
    }
    catch (error) {
        next(error);
    }
};
exports.getOpportunity = getOpportunity;
const updateOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity_1.default.findById(req.params.id);
        if (!opportunity) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Opportunity not found', 404);
        }
        Object.assign(opportunity, req.body);
        await opportunity.save();
        (0, response_1.sendSuccess)(res, opportunity);
    }
    catch (error) {
        next(error);
    }
};
exports.updateOpportunity = updateOpportunity;
const deleteOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity_1.default.findByIdAndDelete(req.params.id);
        if (!opportunity) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Opportunity not found', 404);
        }
        (0, response_1.sendSuccess)(res, { message: 'Opportunity deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOpportunity = deleteOpportunity;
