import type {
  Application,
  ApplicationStatus,
  DashboardData,
  DemoUser,
  PlacementDrive,
  Student,
  UserSession,
} from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.');
  return body;
}

export const dashboardApi = {
  getPublicDrives: () => request<{ drives: PlacementDrive[] }>('/api/drives/public'),
  getDemoUsers: () => request<{ users: DemoUser[] }>('/api/auth/demo-users'),
  login: (email: string, password: string) =>
    request<{ session: UserSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getDashboard: (studentId: string) => request<DashboardData>(`/api/dashboard/${studentId}`),
  createApplication: (
    studentId: string,
    driveId: string,
    status: Extract<ApplicationStatus, 'saved' | 'applied'>,
  ) =>
    request<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ studentId, driveId, status }),
    }),
  updateApplication: (applicationId: string, status: ApplicationStatus) =>
    request<Application>(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateStudent: (studentId: string, changes: Partial<Student>) =>
    request<Student>(`/api/students/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
};
