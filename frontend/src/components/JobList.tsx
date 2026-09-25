import type { Job } from '../types';

interface JobListProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCloseJob: (jobId: string) => void;
}

const statusStyles: Record<Job['status'], string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-700',
};

export default function JobList({ jobs, onSelectJob, onCloseJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-gray-500 bg-white rounded-lg shadow p-6">
        No job postings yet. Create one above to get started.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Deadline</th>
            <th className="px-4 py-3 font-medium">Applicants</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {jobs.map((job) => (
            <tr key={job._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{job.title}</td>
              <td className="px-4 py-3 text-gray-600">{job.companyName}</td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onSelectJob(job)}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  {job.applicantCount ?? 0} applicant{job.applicantCount === 1 ? '' : 's'}
                </button>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[job.status]}`}
                >
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {job.status === 'open' && (
                  <button
                    onClick={() => onCloseJob(job._id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    Close
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
