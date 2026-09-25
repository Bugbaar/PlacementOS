export type EmploymentType = 'full-time' | 'internship' | 'part-time' | 'contract';
export type JobStatus = 'open' | 'closed' | 'draft';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired';

export interface EligibilityCriteria {
  minCgpa: number;
  allowedBranches: string[];
  maxBacklogs: number | null;
}

export interface Job {
  _id: string;
  recruiterId: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  employmentType: EmploymentType;
  eligibilityCriteria: EligibilityCriteria;
  ctc: string;
  applicationDeadline: string;
  status: JobStatus;
  applicantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  resumeUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface NewJobInput {
  recruiterId: string;
  title: string;
  description: string;
  companyName: string;
  location?: string;
  employmentType?: EmploymentType;
  ctc?: string;
  applicationDeadline: string;
}
