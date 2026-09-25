import type { Application, Job, NewJobInput } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || 'Request failed');
  }
  return body.data as T;
}

export async function fetchJobs(recruiterId: string): Promise<Job[]> {
  const res = await fetch(`${BASE_URL}/jobs?recruiterId=${recruiterId}`);
  return handleResponse<Job[]>(res);
}

export async function createJob(input: NewJobInput): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<Job>(res);
}

export async function closeJob(jobId: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'closed' }),
  });
  return handleResponse<Job>(res);
}

export async function fetchApplicationsForJob(jobId: string): Promise<Application[]> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/applications`);
  return handleResponse<Application[]>(res);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status']
): Promise<Application> {
  const res = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Application>(res);
}
