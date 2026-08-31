export interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
}

export const analyzeSkillGap = (studentSkills: string[], requiredSkills: string[]): SkillGapResult => {
  const normalizedStudentSkills = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase().trim());

  const matchedSkills = normalizedRequiredSkills.filter((req) => normalizedStudentSkills.includes(req));
  const missingSkills = normalizedRequiredSkills.filter((req) => !normalizedStudentSkills.includes(req));

  // Find original case for matched/missing based on requiredSkills
  const getOriginalCase = (normalizedSkill: string) => {
    return requiredSkills.find((s) => s.toLowerCase().trim() === normalizedSkill) || normalizedSkill;
  };

  return {
    matchedSkills: matchedSkills.map(getOriginalCase),
    missingSkills: missingSkills.map(getOriginalCase),
  };
};
