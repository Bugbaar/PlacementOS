"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSkillGap = void 0;
const analyzeSkillGap = (studentSkills, requiredSkills) => {
    const normalizedStudentSkills = studentSkills.map((s) => s.toLowerCase().trim());
    const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase().trim());
    const matchedSkills = normalizedRequiredSkills.filter((req) => normalizedStudentSkills.includes(req));
    const missingSkills = normalizedRequiredSkills.filter((req) => !normalizedStudentSkills.includes(req));
    // Find original case for matched/missing based on requiredSkills
    const getOriginalCase = (normalizedSkill) => {
        return requiredSkills.find((s) => s.toLowerCase().trim() === normalizedSkill) || normalizedSkill;
    };
    return {
        matchedSkills: matchedSkills.map(getOriginalCase),
        missingSkills: missingSkills.map(getOriginalCase),
    };
};
exports.analyzeSkillGap = analyzeSkillGap;
