import api, { getAuthToken } from '../services/api';

export interface ShortlistCriteria {
  companyName: string;
  driveName: string;
  minCgpa: number;
  maxActiveBacklogs: number;
  requiredSkills: string[];
  skillMatchMode: 'all' | 'any';
  allowedBranches: string[];
}

export interface ShortlistUploadResult {
  batchId: string;
  fileName: string;
  count: number;
  parseErrors: string[];
  preview: Array<{ rollNumber: string; name: string; branch: string; cgpa: number }>;
  branches: string[];
  skillUniverse: string[];
}

export interface ShortlistRunResult {
  runId: string;
  metrics: {
    total: number;
    shortlisted: number;
    rejected: number;
    shortlistRate: number;
    avgCgpaShortlisted: number;
    elapsedMs: number;
  };
  logs: string[];
  results: Array<{
    eligible: boolean;
    reasons: string[];
    matchedSkills: string[];
    student: {
      rollNumber: string;
      name: string;
      email: string;
      branch: string;
      cgpa: number;
      activeBacklogs: number;
      skills: string[];
    };
  }>;
  notifications: Array<{
    id: string;
    channel: string;
    recipient: string;
    message: string;
    status: string;
  }>;
}

const API_ROOT =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000';

export async function uploadStudentCsv(file: File): Promise<ShortlistUploadResult> {
  const form = new FormData();
  form.append('file', file);
  const headers: HeadersInit = {};
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_ROOT}/api/shortlist/upload`, {
    method: 'POST',
    headers,
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Upload failed');
  }
  return body as ShortlistUploadResult;
}

export async function runShortlistEngine(
  batchId: string,
  criteria: ShortlistCriteria,
): Promise<ShortlistRunResult> {
  const { data } = await api.post<ShortlistRunResult>('/shortlist/run', { batchId, criteria });
  return data;
}

export function exportShortlistUrl(runId: string, kind: 'csv' | 'pdf', mode?: 'shortlisted' | 'audit') {
  const q = kind === 'csv' && mode ? `?mode=${mode}` : '';
  return `${API_ROOT}/api/shortlist/runs/${runId}/export.${kind}${q}`;
}
