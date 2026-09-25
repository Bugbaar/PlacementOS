import { useEffect, useState } from 'react';
import {
  fetchApplicants,
  updateApplicantStatus,
  type ApplicantPipelineStatus,
  type RecruiterApplicant,
  type RecruiterOpportunity,
} from '../../api/recruiter';

interface Props {
  job: RecruiterOpportunity;
  onClose: () => void;
}

const STATUS_OPTIONS: ApplicantPipelineStatus[] = [
  'applied',
  'shortlisted',
  'interview',
  'rejected',
  'offered',
  'accepted',
];

export default function RecruiterApplicantList({ job, onClose }: Props) {
  const [applications, setApplications] = useState<RecruiterApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplicants(job._id);
      setApplications(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job._id]);

  const handleStatusChange = async (applicationId: string, status: ApplicantPipelineStatus) => {
    try {
      const updated = await updateApplicantStatus(applicationId, status);
      setApplications((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">Applicants</h3>
            <p className="text-xs text-slate-500 mt-0.5">{job.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          {loading && <p className="text-sm text-slate-500">Loading applicants…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && applications.length === 0 && (
            <p className="text-sm text-slate-500">No applications yet for this posting.</p>
          )}

          {!loading && applications.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {applications.map((app) => (
                <li key={app._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{app.studentName}</p>
                    <p className="text-xs text-slate-500 truncate">{app.studentEmail}</p>
                    {(app.branch || app.cgpa != null) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {[app.branch, app.cgpa != null ? `CGPA ${app.cgpa}` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <select
                    className="border border-slate-200 rounded-lg text-sm px-2 py-1.5 shrink-0"
                    value={STATUS_OPTIONS.includes(app.status as ApplicantPipelineStatus) ? app.status : 'applied'}
                    onChange={(e) =>
                      handleStatusChange(app._id, e.target.value as ApplicantPipelineStatus)
                    }
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
