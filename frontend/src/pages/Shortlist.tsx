import { FormEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';
import {
  exportShortlistUrl,
  runShortlistEngine,
  ShortlistCriteria,
  ShortlistRunResult,
  ShortlistUploadResult,
  uploadStudentCsv,
} from '../api/shortlist';
import { getAuthToken } from '../services/api';

const defaultCriteria: ShortlistCriteria = {
  companyName: 'Campus Drive',
  driveName: 'Eligibility Pass',
  minCgpa: 7,
  maxActiveBacklogs: 0,
  requiredSkills: ['React', 'Node.js'],
  skillMatchMode: 'all',
  allowedBranches: [],
};

export default function Shortlist() {
  const { currentStudent } = useSelector((state: RootState) => state.student);
  const [criteria, setCriteria] = useState<ShortlistCriteria>(defaultCriteria);
  const [skillsText, setSkillsText] = useState(defaultCriteria.requiredSkills.join(', '));
  const [branchesText, setBranchesText] = useState('');
  const [upload, setUpload] = useState<ShortlistUploadResult | null>(null);
  const [run, setRun] = useState<ShortlistRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shortlisted = useMemo(
    () => run?.results.filter((r) => r.eligible).slice(0, 50) ?? [],
    [run],
  );

  if (currentStudent?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setError(null);
    setRun(null);
    setBusy(true);
    try {
      const result = await uploadStudentCsv(file);
      setUpload(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function onRun(event: FormEvent) {
    event.preventDefault();
    if (!upload?.batchId) {
      setError('Upload a student CSV first.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const payload: ShortlistCriteria = {
        ...criteria,
        requiredSkills: skillsText
          .split(/[|,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        allowedBranches: branchesText
          .split(/[|,]/)
          .map((s) => s.trim())
          .filter(Boolean),
      };
      setCriteria(payload);
      const result = await runShortlistEngine(upload.batchId, payload);
      setRun(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Engine failed');
    } finally {
      setBusy(false);
    }
  }

  async function download(kind: 'csv' | 'pdf', mode?: 'shortlisted' | 'audit') {
    if (!run?.runId) return;
    const token = getAuthToken();
    const res = await fetch(exportShortlistUrl(run.runId, kind, mode), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      setError('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placementos-shortlist.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
          Placement Cell
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Shortlist Engine</h1>
        <p className="mt-1 text-slate-600">
          Upload a student CSV, set drive criteria, and run automated eligibility shortlisting.
        </p>
      </div>

      <form onSubmit={onRun} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm ring-1 ring-teal-900/5">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Company</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={criteria.companyName}
              onChange={(e) => setCriteria({ ...criteria, companyName: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Drive</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={criteria.driveName}
              onChange={(e) => setCriteria({ ...criteria, driveName: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Min CGPA</span>
            <input
              type="number"
              step="0.1"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={criteria.minCgpa}
              onChange={(e) => setCriteria({ ...criteria, minCgpa: Number(e.target.value) })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Max active backlogs</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={criteria.maxActiveBacklogs}
              onChange={(e) =>
                setCriteria({ ...criteria, maxActiveBacklogs: Number(e.target.value) })
              }
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Required skills (comma-separated)</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Skill match</span>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={criteria.skillMatchMode}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  skillMatchMode: e.target.value === 'any' ? 'any' : 'all',
                })
              }
            >
              <option value="all">All required</option>
              <option value="any">Any one</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Allowed branches (optional)</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="CSE, IT"
              value={branchesText}
              onChange={(e) => setBranchesText(e.target.value)}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Student CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="mt-1 block w-full text-sm"
            onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-slate-500">
            Sample:{' '}
            <a className="text-blue-600 underline" href="/sample-students-500.csv" download>
              sample-students-500.csv
            </a>
          </p>
        </label>

        {upload ? (
          <p className="text-sm text-slate-600">
            Uploaded <strong>{upload.fileName}</strong> — {upload.count} students
            {upload.parseErrors.length ? ` (${upload.parseErrors.length} parse warnings)` : ''}.
          </p>
        ) : null}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {busy ? 'Working…' : 'Run shortlisting engine'}
        </button>
      </form>

      {run ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 grid sm:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-slate-500">Total</div>
              <div className="text-xl font-semibold">{run.metrics.total}</div>
            </div>
            <div>
              <div className="text-slate-500">Shortlisted</div>
              <div className="text-xl font-semibold text-emerald-600">{run.metrics.shortlisted}</div>
            </div>
            <div>
              <div className="text-slate-500">Rejected</div>
              <div className="text-xl font-semibold text-rose-600">{run.metrics.rejected}</div>
            </div>
            <div>
              <div className="text-slate-500">Rate</div>
              <div className="text-xl font-semibold">
                {Math.round(run.metrics.shortlistRate * 100)}%
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void download('csv', 'shortlisted')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Export shortlist CSV
            </button>
            <button
              type="button"
              onClick={() => void download('csv', 'audit')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Export audit CSV
            </button>
            <button
              type="button"
              onClick={() => void download('pdf')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              Export PDF
            </button>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono max-h-48 overflow-auto space-y-1">
            {run.logs.slice(0, 40).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">Roll</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">CGPA</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {shortlisted.map((row) => (
                  <tr key={row.student.rollNumber} className="border-t border-slate-100">
                    <td className="px-3 py-2">{row.student.rollNumber}</td>
                    <td className="px-3 py-2">{row.student.name}</td>
                    <td className="px-3 py-2">{row.student.branch}</td>
                    <td className="px-3 py-2">{row.student.cgpa}</td>
                    <td className="px-3 py-2 text-emerald-600">SHORTLISTED</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shortlisted.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No shortlisted students for these criteria.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
