import { useState, FormEvent } from 'react';
import { analyzeResumeFit, ResumeFitResponse } from '../api/resumeFit';

export default function ResumeFit() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ResumeFitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!resumeFile) {
      setError('Please attach a PDF resume.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await analyzeResumeFit(resumeFile, jobDescription);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Resume Fit Scorer</h1>
        <p className="mt-1 text-slate-600">
          Upload a resume PDF and paste a job description to see skill match percentage,
          missing skills, and the most relevant resume bullets.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="resume">
            Resume (PDF, max 5MB)
          </label>
          <input
            id="resume"
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 border border-slate-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="jd">
            Job description
          </label>
          <textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="block w-full text-sm border border-slate-300 rounded-md p-2"
            placeholder="Paste the job description here..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze fit'}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <div>
            <span className="text-3xl font-bold text-slate-900">{result.matchPercentage}%</span>
            <span className="text-slate-500 text-sm ml-2">skill match</span>
          </div>

          <div>
            <h2 className="text-sm font-medium text-slate-700">Matched skills</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              {result.matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-slate-700">Missing skills</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              {result.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-slate-700">Most relevant resume bullets</h2>
            <ul className="mt-1 space-y-1">
              {result.topRelevantBullets.map((item, index) => (
                <li key={index} className="text-sm text-slate-600">
                  <span className="text-slate-400 text-xs mr-2">{item.score.toFixed(2)}</span>
                  {item.bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
