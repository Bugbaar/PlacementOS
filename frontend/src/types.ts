export interface StudentRecord {
  rollNumber: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  skills: string[];
}

export interface EligibilityCriteria {
  companyName: string;
  driveName: string;
  minCgpa: number;
  maxActiveBacklogs: number;
  requiredSkills: string[];
  skillMatchMode: "all" | "any";
  allowedBranches: string[];
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

export interface NotificationLog {
  id: string;
  runId: string;
  channel: "email" | "whatsapp" | "in-app";
  recipient: string;
  message: string;
  status: "queued" | "sent" | "failed";
  createdAt: string;
}

export interface UploadResponse {
  batchId: string;
  fileName: string;
  count: number;
  parseErrors: string[];
  preview: StudentRecord[];
  branches: string[];
  skillUniverse: string[];
}

export interface RunResponse {
  runId: string;
  metrics: EngineMetrics;
  logs: string[];
  results: EvaluationResult[];
  notifications: NotificationLog[];
  createdAt: string;
}

export const defaultCriteria: EligibilityCriteria = {
  companyName: "Nimbus Systems",
  driveName: "SDE Intern 2026",
  minCgpa: 8,
  maxActiveBacklogs: 0,
  requiredSkills: ["Node.js"],
  skillMatchMode: "all",
  allowedBranches: ["CSE", "IT"],
};
