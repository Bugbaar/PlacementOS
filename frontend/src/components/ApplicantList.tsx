import { useEffect, useState } from 'react';
import type { Application, ApplicationStatus, Job } from '../types';
import { fetchApplicationsForJob, updateApplicationStatus } from '../api/recruiterApi';

interface ApplicantListProps {
  job: Job;
  onClose: () => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'applied',
  'shortlisted',
  'interview',
  'rejected',
  'hired',
];

export default function ApplicantList({ job, onClose }: ApplicantListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplicationsForJob(job._id);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job._id]);

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    try {
      const updated = await updateApplicationStatus(applicationId, status);
      setApplications((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Applicants — {job.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close ✕
          </button>
        </div>

        <div className="p-6">
          {loading && <p className="text-sm text-gray-500">Loading applicants…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && applications.length === 0 && (
            <p className="text-sm text-gray-500">No applications yet for this posting.</p>
          )}

          {!loading && applications.length > 0 && (
            <ul className="divide-y">
              {applications.map((app) => (
                <li key={app._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">{app.studentName}</p>
                    <p className="text-xs text-gray-500">{app.studentEmail}</p>
                  </div>
                  <select
                    className="border rounded text-sm px-2 py-1"
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app._id, e.target.value as ApplicationStatus)
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
