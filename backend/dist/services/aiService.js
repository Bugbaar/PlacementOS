"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSkillRecommendations = exports.generateOpportunityExplanation = exports.generateCareerAdvice = void 0;
const matchingService_1 = require("./matchingService");
const generateCareerAdvice = (student) => {
    // Deterministic fallback based on profile
    let advice = `Based on your profile, you are focusing on ${student.preferredRoles.join(', ') || 'various roles'}. `;
    if (student.cgpa < 7) {
        advice += `Your CGPA is ${student.cgpa}. While some companies have strict cut-offs, many value strong projects and skills. Focus on building your portfolio. `;
    }
    else {
        advice += `You have a strong CGPA of ${student.cgpa}. Maintain this academic performance while building practical skills. `;
    }
    if (student.skills.length < 3) {
        advice += `You only have a few skills listed. Try to learn complementary technologies to broaden your opportunities. `;
    }
    else {
        advice += `You have a good technical foundation with ${student.skills.join(', ')}. Continue deepening your expertise in these areas. `;
    }
    return advice.trim();
};
exports.generateCareerAdvice = generateCareerAdvice;
const generateOpportunityExplanation = (student, opportunity) => {
    const match = (0, matchingService_1.calculateMatchScore)(student, opportunity);
    if (!match.eligible) {
        return `You are not eligible for this opportunity because: ${match.reasons.join(', ')}.`;
    }
    let explanation = `You are a ${match.matchScore}% match for this ${opportunity.title} role at ${opportunity.company}. `;
    if (match.matchedSkills.length > 0) {
        explanation += `Your skills in ${match.matchedSkills.join(', ')} align well with their requirements. `;
    }
    if (match.missingSkills.length > 0) {
        explanation += `However, you might want to brush up on ${match.missingSkills.join(', ')} as they are required for this role. `;
    }
    explanation += `Your academic and location preferences were also factored into this score.`;
    return explanation;
};
exports.generateOpportunityExplanation = generateOpportunityExplanation;
const generateSkillRecommendations = (student) => {
    // Deterministic mock recommendations based on existing skills
    const allSkills = student.skills.map(s => s.toLowerCase());
    const recommendations = [];
    if (allSkills.includes('react') && !allSkills.includes('node.js'))
        recommendations.push('Node.js');
    if (allSkills.includes('node.js') && !allSkills.includes('mongodb'))
        recommendations.push('MongoDB');
    if (!allSkills.includes('docker'))
        recommendations.push('Docker');
    if (!allSkills.includes('aws') && !allSkills.includes('gcp'))
        recommendations.push('AWS');
    if (allSkills.includes('python') && !allSkills.includes('django'))
        recommendations.push('Django');
    if (recommendations.length === 0) {
        recommendations.push('TypeScript', 'GraphQL', 'Kubernetes');
    }
    return recommendations.slice(0, 3); // Return top 3
};
exports.generateSkillRecommendations = generateSkillRecommendations;
