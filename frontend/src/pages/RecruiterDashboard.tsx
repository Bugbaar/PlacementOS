import { useEffect, useState } from 'react';
import type { Job } from '../types';
import { closeJob, fetchJobs } from '../api/recruiterApi';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import ApplicantList from '../components/ApplicantList';

// In the full app this comes from the logged-in recruiter's session.
// Hardcoded here since auth is out of scope for this contribution —
// swap for `useAuth().user.id` once the auth module lands.
const DEMO_RECRUITER_ID = '000000000000000000000001';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs(DEMO_RECRUITER_ID);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCloseJob = async (jobId: string) => {
    await closeJob(jobId);
    loadJobs();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Recruiter Portal</h1>

        <JobForm recruiterId={DEMO_RECRUITER_ID} onCreated={loadJobs} />

        {loading && <p className="text-sm text-gray-500">Loading jobs…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <JobList jobs={jobs} onSelectJob={setSelectedJob} onCloseJob={handleCloseJob} />
        )}

        {selectedJob && (
          <ApplicantList job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </div>
    </div>
  );
}
