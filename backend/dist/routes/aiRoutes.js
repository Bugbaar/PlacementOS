"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
router.get('/advice/:studentId', aiController_1.getCareerAdvice);
router.get('/explanation/:studentId/:opportunityId', aiController_1.getOpportunityExplanation);
router.get('/skills/:studentId', aiController_1.getSkillRecommendations);
exports.default = router;
