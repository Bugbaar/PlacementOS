export interface StudentRecord {
  rollNumber: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  skills: string[];
  tenthPercent?: number;
  twelfthPercent?: number;
}

export interface EligibilityCriteria {
  companyName: string;
  driveName: string;
  minCgpa: number;
  maxActiveBacklogs: number;
  requiredSkills: string[];
  skillMatchMode: 'all' | 'any';
  allowedBranches: string[];
  minTenthPercent?: number;
  minTwelfthPercent?: number;
}

export interface EvaluationResult {
  student: StudentRecord;
  eligible: boolean;
  reasons: string[];
  matchedSkills: string[];
}

export interface EngineMetrics {
  total: number;
  shortlisted: number;
  rejected: number;
  shortlistRate: number;
  avgCgpaShortlisted: number;
  elapsedMs: number;
}

export interface EngineRunPayload {
  id: string;
  batchId: string;
  criteria: EligibilityCriteria;
  results: EvaluationResult[];
  metrics: EngineMetrics;
  logs: string[];
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  runId: string;
  channel: 'email' | 'whatsapp' | 'in-app';
  recipient: string;
  message: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: string;
}
