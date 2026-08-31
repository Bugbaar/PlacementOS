import { useState } from "react";

interface Suggestion {
  section: string;
  issue: string;
  suggestion: string;
}

interface AnalysisResult {
  atsScore: number;
  breakdown: {
    contact: { passed: boolean; hasEmail: boolean; hasPhone: boolean };
    sections: { passed: boolean; missing: string[] };
    length: { passed: boolean; wordCount: number };
    keywords: { applicable: boolean; matchRatio?: number; passed: boolean };
  };
  overallImpression: string;
  suggestions: Suggestion[];
  missingSections: string[];
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    if (targetRole) formData.append("targetRole", targetRole);

    try {
      const res = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong analyzing your resume");
        return;
      }

      setResult(data);
    } catch {
      setError("Could not reach the resume analysis service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">AI Resume Reviewer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
        <input
          type="text"
          placeholder="Target role (optional, e.g. Backend Developer)"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="block w-full border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{result.atsScore}</span>
            <span className="text-sm text-gray-500">ATS Score / 100</span>
          </div>

          <p className="text-sm text-gray-700">{result.overallImpression}</p>

          {result.missingSections.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Missing sections: </span>
              {result.missingSections.join(", ")}
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Suggestions</h3>
            <ul className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="border rounded p-3 text-sm">
                  <div className="font-medium">{s.section}</div>
                  <div className="text-gray-600">{s.issue}</div>
                  <div className="text-blue-700 mt-1">{s.suggestion}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
