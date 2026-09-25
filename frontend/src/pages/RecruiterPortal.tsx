import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';
import {
  closeOpportunity,
  fetchMyOpportunities,
  type RecruiterOpportunity,
} from '../api/recruiter';
import RecruiterJobForm from '../components/recruiter/RecruiterJobForm';
import RecruiterJobList from '../components/recruiter/RecruiterJobList';
import RecruiterApplicantList from '../components/recruiter/RecruiterApplicantList';

export default function RecruiterPortal() {
  const { currentStudent } = useSelector((state: RootState) => state.student);
  const [jobs, setJobs] = useState<RecruiterOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<RecruiterOpportunity | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOpportunities();
      setJobs(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStudent?.role === 'recruiter') {
      void loadJobs();
    }
  }, [currentStudent?.role]);

  if (currentStudent?.role !== 'recruiter') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCloseJob = async (jobId: string) => {
    try {
      await closeOpportunity(jobId);
      await loadJobs();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to close job.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Recruiter</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Hiring portal</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Post campus roles and move applicants through your pipeline.
        </p>
      </div>

      <RecruiterJobForm onCreated={loadJobs} />

      {loading && <p className="text-sm text-slate-500">Loading your postings…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <RecruiterJobList jobs={jobs} onSelectJob={setSelectedJob} onCloseJob={handleCloseJob} />
      )}

      {selectedJob && (
        <RecruiterApplicantList job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
