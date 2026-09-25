import { describe, expect, it } from 'vitest';
import { evaluateStudent, runEligibilityEngine } from '../eligibilityEngine';
import type { EligibilityCriteria, StudentRecord } from '../types';

const baseCriteria: EligibilityCriteria = {
  companyName: 'Acme',
  driveName: 'SDE Intern',
  minCgpa: 7,
  maxActiveBacklogs: 0,
  requiredSkills: ['React', 'Node.js'],
  skillMatchMode: 'all',
  allowedBranches: ['CSE', 'IT'],
};

const student: StudentRecord = {
  rollNumber: 'CSE001',
  name: 'Ada',
  email: 'ada@example.com',
  branch: 'CSE',
  cgpa: 8.2,
  activeBacklogs: 0,
  skills: ['React', 'Node.js', 'MongoDB'],
};

describe('shortlist eligibilityEngine', () => {
  it('marks matching students eligible', () => {
    const result = evaluateStudent(student, baseCriteria);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('rejects low CGPA and wrong branch', () => {
    const result = evaluateStudent(
      { ...student, cgpa: 6, branch: 'ME' },
      baseCriteria,
    );
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => /CGPA/i.test(r))).toBe(true);
    expect(result.reasons.some((r) => /Branch/i.test(r))).toBe(true);
  });

  it('runs batch metrics', () => {
    const { metrics, results } = runEligibilityEngine(
      [student, { ...student, rollNumber: 'CSE002', cgpa: 5 }],
      baseCriteria,
    );
    expect(results).toHaveLength(2);
    expect(metrics.shortlisted).toBe(1);
    expect(metrics.rejected).toBe(1);
  });
});
