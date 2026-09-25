import api from '../services/api';

export type RecruiterOpportunityStatus = 'active' | 'closed' | 'draft';
export type ApplicantPipelineStatus =
  | 'applied'
  | 'shortlisted'
  | 'interview'
  | 'rejected'
  | 'offered'
  | 'accepted';

export interface RecruiterOpportunity {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  applicationDeadline: string;
  status: RecruiterOpportunityStatus;
  applicantCount?: number;
  requiredSkills?: string[];
  minimumCgpa?: number;
  postedBy?: string;
}

export interface RecruiterApplicant {
  _id: string;
  opportunityId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: ApplicantPipelineStatus | 'saved';
  appliedAt: string;
  resumeUrl?: string | null;
  branch?: string;
  cgpa?: number;
  college?: string;
  skills?: string[];
}

export interface NewOpportunityInput {
  title: string;
  company: string;
  description: string;
  location?: string;
  employmentType?: string;
  salaryRange?: string;
  applicationDeadline: string;
  requiredSkills?: string[];
  minimumCgpa?: number;
}

export async function fetchMyOpportunities(): Promise<RecruiterOpportunity[]> {
  const response = await api.get('/recruiter/opportunities');
  return response.data.data;
}

export async function createOpportunity(input: NewOpportunityInput): Promise<RecruiterOpportunity> {
  const response = await api.post('/recruiter/opportunities', input);
  return response.data.data;
}

export async function closeOpportunity(id: string): Promise<RecruiterOpportunity> {
  const response = await api.patch(`/recruiter/opportunities/${id}`, { status: 'closed' });
  return response.data.data;
}

export async function fetchApplicants(opportunityId: string): Promise<RecruiterApplicant[]> {
  const response = await api.get(`/recruiter/opportunities/${opportunityId}/applications`);
  return response.data.data;
}

export async function updateApplicantStatus(
  applicationId: string,
  status: ApplicantPipelineStatus,
): Promise<RecruiterApplicant> {
  const response = await api.patch(`/recruiter/applications/${applicationId}/status`, { status });
  return response.data.data;
}
