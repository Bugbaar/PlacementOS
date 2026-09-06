import type {
  EligibilityCheck,
  EligibilityDecision,
  PlacementDrive,
  Student,
} from './types.js';

const normalize = (value: string) => value.trim().toLowerCase();

export function evaluateEligibility(
  student: Student,
  drive: PlacementDrive,
): EligibilityDecision {
  const { eligibility } = drive;
  const checks: EligibilityCheck[] = [];

  const cgpaPassed = student.cgpa >= eligibility.minCgpa;
  checks.push({
    key: 'cgpa',
    label: 'CGPA',
    passed: cgpaPassed,
    message: cgpaPassed
      ? `${student.cgpa.toFixed(1)} meets the ${eligibility.minCgpa.toFixed(1)} minimum`
      : `${student.cgpa.toFixed(1)} is below the ${eligibility.minCgpa.toFixed(1)} minimum`,
  });

  if (eligibility.allowedBranches?.length) {
    const allowedBranches = eligibility.allowedBranches.map(normalize);
    const branchPassed = allowedBranches.includes(normalize(student.branch));
    checks.push({
      key: 'branch',
      label: 'Branch',
      passed: branchPassed,
      message: branchPassed
        ? `${student.branch} is an accepted branch`
        : `Open to ${eligibility.allowedBranches.join(', ')}`,
    });
  }

  if (eligibility.graduationYears?.length) {
    const graduationPassed = eligibility.graduationYears.includes(student.graduationYear);
    checks.push({
      key: 'graduationYear',
      label: 'Graduation year',
      passed: graduationPassed,
      message: graduationPassed
        ? `Class of ${student.graduationYear} is eligible`
        : `Open to the class of ${eligibility.graduationYears.join(' or ')}`,
    });
  }

  const backlogLimit = eligibility.maxActiveBacklogs ?? 0;
  const backlogsPassed = student.activeBacklogs <= backlogLimit;
  checks.push({
    key: 'backlogs',
    label: 'Active backlogs',
    passed: backlogsPassed,
    message: backlogsPassed
      ? `${student.activeBacklogs} active backlogs (maximum ${backlogLimit})`
      : `${student.activeBacklogs} active backlogs exceeds the maximum of ${backlogLimit}`,
  });

  const studentSkills = new Set(student.skills.map(normalize));
  const matchedSkills = drive.skills.filter((skill) => studentSkills.has(normalize(skill)));
  const missingSkills = drive.skills.filter((skill) => !studentSkills.has(normalize(skill)));
  const passedChecks = checks.filter((check) => check.passed).length;

  return {
    eligible: checks.every((check) => check.passed),
    score: Math.round((passedChecks / checks.length) * 100),
    checks,
    matchedSkills,
    missingSkills,
  };
}

