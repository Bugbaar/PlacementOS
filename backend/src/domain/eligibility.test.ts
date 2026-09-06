import { describe, expect, it } from 'vitest';
import { evaluateEligibility } from './eligibility.js';
import type { PlacementDrive, Student } from './types.js';

const student: Student = {
  id: 'student-test',
  name: 'Test Student',
  email: 'student@example.edu',
  program: 'B.Tech',
  branch: 'Computer Science',
  graduationYear: 2027,
  cgpa: 8.2,
  activeBacklogs: 0,
  skills: ['React', 'TypeScript'],
  profileCompletion: 80,
};

const drive: PlacementDrive = {
  id: 'drive-test',
  company: 'Example Co',
  companyMark: 'E',
  role: 'Software Engineer',
  type: 'Internship',
  location: 'Remote',
  workMode: 'Remote',
  salary: '₹30,000 / month',
  closingDate: '2027-01-01T00:00:00.000Z',
  openings: 2,
  description: 'A test placement drive.',
  skills: ['React', 'Node.js'],
  eligibility: {
    minCgpa: 8,
    allowedBranches: ['Computer Science'],
    graduationYears: [2027],
    maxActiveBacklogs: 0,
  },
};

describe('evaluateEligibility', () => {
  it('returns an explainable eligible decision when every hard rule passes', () => {
    const result = evaluateEligibility(student, drive);

    expect(result.eligible).toBe(true);
    expect(result.score).toBe(100);
    expect(result.checks).toHaveLength(4);
    expect(result.matchedSkills).toEqual(['React']);
    expect(result.missingSkills).toEqual(['Node.js']);
  });

  it('treats minimum and maximum boundaries as eligible', () => {
    const result = evaluateEligibility(
      { ...student, cgpa: 8, activeBacklogs: 0 },
      drive,
    );

    expect(result.eligible).toBe(true);
  });

  it('compares branches case-insensitively', () => {
    const result = evaluateEligibility(
      { ...student, branch: 'computer science' },
      drive,
    );

    expect(result.checks.find((check) => check.key === 'branch')?.passed).toBe(true);
  });

  it('normalizes uppercase I consistently in branch and skill matching', () => {
    const itDrive: PlacementDrive = {
      ...drive,
      eligibility: { ...drive.eligibility, allowedBranches: ['Information Technology'] },
      skills: ['Information Technology', 'React'],
    };
    const result = evaluateEligibility(
      { ...student, branch: 'INFORMATION TECHNOLOGY', skills: ['INFORMATION TECHNOLOGY', 'REACT'] },
      itDrive,
    );

    expect(result.checks.find((check) => check.key === 'branch')?.passed).toBe(true);
    expect(result.matchedSkills).toEqual(['Information Technology', 'React']);
    expect(result.missingSkills).toEqual([]);
  });

  it('reports every failed rule instead of stopping at the first failure', () => {
    const result = evaluateEligibility(
      { ...student, cgpa: 6.5, graduationYear: 2028, activeBacklogs: 2 },
      drive,
    );

    expect(result.eligible).toBe(false);
    expect(result.checks.filter((check) => !check.passed).map((check) => check.key)).toEqual([
      'cgpa',
      'graduationYear',
      'backlogs',
    ]);
    expect(result.score).toBe(25);
  });
});

