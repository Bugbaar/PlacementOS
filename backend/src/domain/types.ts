export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offered'
  | 'rejected';

export interface Student {
  id: string;
  name: string;
  email: string;
  program: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  activeBacklogs: number;
  skills: string[];
  profileCompletion: number;
}

export interface EligibilityRules {
  minCgpa: number;
  allowedBranches?: string[];
  graduationYears?: number[];
  maxActiveBacklogs?: number;
}

export interface PlacementDrive {
  id: string;
  company: string;
  companyMark: string;
  role: string;
  type: 'Internship' | 'Full-time';
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  salary: string;
  closingDate: string;
  openings: number;
  description: string;
  skills: string[];
  eligibility: EligibilityRules;
}

export interface Application {
  id: string;
  studentId: string;
  driveId: string;
  status: ApplicationStatus;
  updatedAt: string;
}

export interface EligibilityCheck {
  key: 'cgpa' | 'branch' | 'graduationYear' | 'backlogs';
  label: string;
  passed: boolean;
  message: string;
}

export interface EligibilityDecision {
  eligible: boolean;
  score: number;
  checks: EligibilityCheck[];
  matchedSkills: string[];
  missingSkills: string[];
}

