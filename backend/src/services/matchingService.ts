import { IStudent } from '../models/Student';
import { IOpportunity } from '../models/Opportunity';
import { checkEligibility, EligibilityResult } from './eligibilityService';
import { analyzeSkillGap } from './skillGapService';

export interface MatchResult extends EligibilityResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  scoreBreakdown: {
    technical: number; // out of 60
    academic: number; // out of 20
    role: number; // out of 10
    location: number; // out of 10
  };
}

// Weights
const WEIGHT_TECHNICAL = 60;
const WEIGHT_ACADEMIC = 20;
const WEIGHT_ROLE = 10;
const WEIGHT_LOCATION = 10;

export const calculateMatchScore = (student: IStudent, opportunity: IOpportunity): MatchResult => {
  const eligibility = checkEligibility(student, opportunity);
  const { matchedSkills, missingSkills } = analyzeSkillGap(student.skills, opportunity.requiredSkills);

  // 1. Technical Skill Match (60%)
  let technicalScore: number;
  if (opportunity.requiredSkills.length > 0) {
    technicalScore = (matchedSkills.length / opportunity.requiredSkills.length) * WEIGHT_TECHNICAL;
  } else {
    technicalScore = WEIGHT_TECHNICAL; // If no skills required, full points
  }

  // 2. Academic Match (20%)
  // Simple normalization: If cgpa >= minimumCgpa, full points. Else, partial based on how close it is (though they would be ineligible).
  let academicScore: number;
  if (student.cgpa >= opportunity.minimumCgpa) {
    // Reward higher CGPA slightly? For simplicity, if eligible academically, they get the base 20.
    // Let's add a small bonus for higher CGPA (e.g. 10 base, up to 10 for CGPA above minimum)
    const baseAcademic = 10;
    const maxBonus = 10;
    const cgpaDiff = student.cgpa - opportunity.minimumCgpa;
    const maxDiff = 10 - opportunity.minimumCgpa;
    const bonus = maxDiff > 0 ? (cgpaDiff / maxDiff) * maxBonus : maxBonus;
    academicScore = baseAcademic + bonus;
  } else {
    academicScore = (student.cgpa / opportunity.minimumCgpa) * WEIGHT_ACADEMIC;
  }
  academicScore = Math.min(academicScore, WEIGHT_ACADEMIC); // Cap at 20

  // 3. Role Preference (10%)
  let roleScore: number;
  if (student.preferredRoles && student.preferredRoles.length > 0) {
    const oppTitle = opportunity.title.toLowerCase();
    const hasRoleMatch = student.preferredRoles.some((role) => oppTitle.includes(role.toLowerCase()));
    roleScore = hasRoleMatch ? WEIGHT_ROLE : 0;
  } else {
    roleScore = WEIGHT_ROLE / 2; // Neutral score if no preferences
  }

  // 4. Location Preference (10%)
  let locationScore: number;
  if (student.preferredLocations && student.preferredLocations.length > 0) {
    const oppLocation = opportunity.location.toLowerCase();
    const isRemote = oppLocation.includes('remote');
    const prefersRemote = student.preferredLocations.some((loc) => loc.toLowerCase().includes('remote'));
    const hasLocMatch = student.preferredLocations.some((loc) => oppLocation.includes(loc.toLowerCase()));

    if (hasLocMatch || (isRemote && prefersRemote)) {
      locationScore = WEIGHT_LOCATION;
    } else {
       // Maybe it's a remote job but they didn't specify remote, give partial
       locationScore = isRemote ? WEIGHT_LOCATION / 2 : 0;
    }
  } else {
    locationScore = WEIGHT_LOCATION / 2; // Neutral score
  }

  const matchScore = Math.round(technicalScore + academicScore + roleScore + locationScore);

  return {
    ...eligibility,
    matchScore,
    matchedSkills,
    missingSkills,
    scoreBreakdown: {
      technical: Math.round(technicalScore),
      academic: Math.round(academicScore),
      role: Math.round(roleScore),
      location: Math.round(locationScore),
    },
  };
};
