export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offered' | 'rejected';

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

export interface EligibilityCheck {
  key: string;
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

export interface Application {
  id: string;
  studentId: string;
  driveId: string;
  status: ApplicationStatus;
  updatedAt: string;
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
  eligibility: {
    minCgpa: number;
    allowedBranches?: string[];
    graduationYears?: number[];
    maxActiveBacklogs?: number;
  };
}

export interface DriveWithDecision extends PlacementDrive {
  eligibilityDecision: EligibilityDecision;
  application: Application | null;
}

export interface DetailedApplication extends Application {
  drive: PlacementDrive;
}

export interface DashboardData {
  student: Student;
  drives: DriveWithDecision[];
  applications: DetailedApplication[];
  stats: {
    eligibleDrives: number;
    totalApplications: number;
    interviews: number;
    offers: number;
  };
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  program: string;
  branch: string;
}

export interface UserSession {
  studentId: string;
  name: string;
  email: string;
  token?: string;
}

export type DashboardView =
  | 'overview'
  | 'drives'
  | 'applications'
  | 'profile'
  | 'analytics'
  | 'help'
  | 'settings';
