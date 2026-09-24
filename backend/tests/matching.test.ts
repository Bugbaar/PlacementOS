import { describe, it, expect } from 'vitest';
import { calculateMatchScore } from '../src/services/matchingService';
import { IStudent } from '../src/models/Student';
import { IOpportunity } from '../src/models/Opportunity';

describe('Explainable Matching Engine', () => {
  const student: Partial<IStudent> = {
    cgpa: 8.5,
    branch: 'Computer Science',
    graduationYear: 2026,
    skills: ['react', 'node.js', 'mongodb', 'typescript'],
    preferredRoles: ['software engineer'],
    preferredLocations: ['remote'],
  };

  const opportunity: Partial<IOpportunity> = {
    title: 'Software Engineer',
    location: 'Remote',
    status: 'active',
    minimumCgpa: 7.0,
    applicationDeadline: new Date(Date.now() + 100000),
    requiredSkills: ['react', 'node.js', 'docker'],
  };

  it('should calculate match score correctly', () => {
    const result = calculateMatchScore(student as IStudent, opportunity as IOpportunity);

    expect(result.eligible).toBe(true);
    
    // Skill match: 2 out of 3 matched -> (2/3) * 60 = 40
    // Academic match: cgpa >= minCgpa -> 10 + bonus (1.5 / 3 * 10) = 10 + 5 = 15
    // Role match: "software engineer" in title -> 10
    // Location match: "Remote" matched -> 10
    // Total should be around 40 + 15 + 10 + 10 = 75
    
    expect(result.matchedSkills).toContain('react');
    expect(result.matchedSkills).toContain('node.js');
    expect(result.missingSkills).toContain('docker');
    
    expect(result.scoreBreakdown.technical).toBe(40);
    expect(result.scoreBreakdown.role).toBe(10);
    expect(result.scoreBreakdown.location).toBe(10);
    expect(result.matchScore).toBeGreaterThan(70);
  });
});
