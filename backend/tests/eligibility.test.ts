import { describe, it, expect } from 'vitest';
import { checkEligibility } from '../src/services/eligibilityService';
import { IStudent } from '../src/models/Student';
import { IOpportunity } from '../src/models/Opportunity';

describe('Eligibility Engine', () => {
  const baseStudent: Partial<IStudent> = {
    cgpa: 8.0,
    branch: 'Computer Science',
    graduationYear: 2026,
  };

  const baseOpportunity: Partial<IOpportunity> = {
    status: 'active',
    minimumCgpa: 7.0,
    eligibleBranches: ['Computer Science'],
    eligibleGraduationYears: [2026],
    applicationDeadline: new Date(Date.now() + 100000), // future
  };

  it('should be eligible for exact match', () => {
    const result = checkEligibility(baseStudent as IStudent, baseOpportunity as IOpportunity);
    expect(result.eligible).toBe(true);
    expect(result.reasons.length).toBe(0);
  });

  it('should fail if CGPA is below minimum', () => {
    const student = { ...baseStudent, cgpa: 6.5 };
    const result = checkEligibility(student as IStudent, baseOpportunity as IOpportunity);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain('CGPA (6.5) is below the required minimum (7)');
  });

  it('should fail if branch is not eligible', () => {
    const student = { ...baseStudent, branch: 'Mechanical' };
    const result = checkEligibility(student as IStudent, baseOpportunity as IOpportunity);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain('Branch (Mechanical) is not eligible');
  });

  it('should fail if graduation year is not eligible', () => {
    const student = { ...baseStudent, graduationYear: 2025 };
    const result = checkEligibility(student as IStudent, baseOpportunity as IOpportunity);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain('Graduation year (2025) is not eligible');
  });

  it('should fail if opportunity is closed', () => {
    const opportunity = { ...baseOpportunity, status: 'closed' };
    const result = checkEligibility(baseStudent as IStudent, opportunity as IOpportunity);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain('Opportunity is not active');
  });

  it('should pass if opportunity has no branch/year restrictions', () => {
    const opportunity = { ...baseOpportunity, eligibleBranches: [], eligibleGraduationYears: [] };
    const student = { ...baseStudent, branch: 'Any', graduationYear: 2024 };
    const result = checkEligibility(student as IStudent, opportunity as IOpportunity);
    expect(result.eligible).toBe(true);
  });
});
