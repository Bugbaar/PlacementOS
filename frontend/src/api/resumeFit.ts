export interface BulletMatch {
  bullet: string;
  score: number;
}

export interface ResumeFitResponse {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  topRelevantBullets: BulletMatch[];
  extractedResumeSkillCount: number;
  extractedJdSkillCount: number;
}

const API_ROOT =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000';

function getToken(): string | null {
  try {
    return localStorage.getItem('placementos_token');
  } catch {
    return null;
  }
}

export async function analyzeResumeFit(
  resumeFile: File,
  jobDescription: string
): Promise<ResumeFitResponse> {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);

  const headers: HeadersInit = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ROOT}/api/resume-fit`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Something went wrong' }));
    const message =
      typeof errorBody.error === 'string'
        ? errorBody.error
        : errorBody.error?.message || 'Analysis failed';
    throw new Error(message);
  }

  return response.json();
}
