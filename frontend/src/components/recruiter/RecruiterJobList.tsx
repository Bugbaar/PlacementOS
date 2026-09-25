import type { RecruiterOpportunity } from '../../api/recruiter';

interface Props {
  jobs: RecruiterOpportunity[];
  onSelectJob: (job: RecruiterOpportunity) => void;
  onCloseJob: (jobId: string) => void;
}

const statusStyles: Record<RecruiterOpportunity['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-200 text-slate-600',
  draft: 'bg-amber-100 text-amber-800',
};

export default function RecruiterJobList({ jobs, onSelectJob, onCloseJob }: Props) {
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 p-6">
        No postings yet. Create one above to start receiving applications.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Deadline</th>
            <th className="px-4 py-3 font-medium">Applicants</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <tr key={job._id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
              <td className="px-4 py-3 text-slate-600">{job.company}</td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelectJob(job)}
                  className="text-amber-700 hover:underline font-medium"
                >
                  {`${job.applicantCount ?? 0} applicant${(job.applicantCount ?? 0) === 1 ? '' : 's'}`}
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
                {job.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => onCloseJob(job._id)}
                    className="text-xs text-slate-500 hover:text-red-600"
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
