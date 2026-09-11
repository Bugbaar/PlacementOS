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

export async function analyzeResumeFit(resumeFile: File, jobDescription: string): Promise<ResumeFitResponse> {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);

  const response = await fetch('/api/resume-fit', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Something went wrong' }));
    throw new Error(typeof errorBody.error === 'string' ? errorBody.error : 'Analysis failed');
  }

  return response.json();
}
