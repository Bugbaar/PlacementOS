"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = void 0;
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const matchingService_1 = require("./matchingService");
const getRecommendations = async (student, page = 1, limit = 10, minScore = 0) => {
    // Fetch active and non-expired opportunities
    const now = new Date();
    const activeOpportunities = await Opportunity_1.default.find({
        status: 'active',
        applicationDeadline: { $gt: now },
    }).exec();
    const recommendations = [];
    for (const opp of activeOpportunities) {
        const matchResult = (0, matchingService_1.calculateMatchScore)(student, opp);
        // Only include eligible opportunities as recommendations
        if (matchResult.eligible && matchResult.matchScore >= minScore) {
            recommendations.push({
                ...matchResult,
                opportunity: opp,
            });
        }
    }
    // Sort by match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = recommendations.slice(startIndex, endIndex);
    return {
        data: paginatedData,
        total: recommendations.length,
        totalPages: Math.ceil(recommendations.length / limit),
    };
};
exports.getRecommendations = getRecommendations;
