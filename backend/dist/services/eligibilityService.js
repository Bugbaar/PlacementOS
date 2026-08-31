"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEligibility = void 0;
const checkEligibility = (student, opportunity) => {
    const reasons = [];
    // Check Status
    if (opportunity.status !== 'active') {
        reasons.push('Opportunity is not active');
    }
    // Check Deadline
    if (new Date() > new Date(opportunity.applicationDeadline)) {
        reasons.push('Application deadline has passed');
    }
    // Check CGPA
    if (student.cgpa < opportunity.minimumCgpa) {
        reasons.push(`CGPA (${student.cgpa}) is below the required minimum (${opportunity.minimumCgpa})`);
    }
    // Check Branch
    if (opportunity.eligibleBranches && opportunity.eligibleBranches.length > 0) {
        if (!opportunity.eligibleBranches.includes(student.branch)) {
            reasons.push(`Branch (${student.branch}) is not eligible`);
        }
    }
    // Check Graduation Year
    if (opportunity.eligibleGraduationYears && opportunity.eligibleGraduationYears.length > 0) {
        if (!opportunity.eligibleGraduationYears.includes(student.graduationYear)) {
            reasons.push(`Graduation year (${student.graduationYear}) is not eligible`);
        }
    }
    return {
        eligible: reasons.length === 0,
        reasons,
    };
};
exports.checkEligibility = checkEligibility;
