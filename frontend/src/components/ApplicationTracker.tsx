import { ArrowRight, Building2, CalendarClock, Download } from 'lucide-react';
import type { ApplicationStatus, DetailedApplication } from '../types';
import { downloadApplicationsCsv } from '../utils/downloads';

interface ApplicationTrackerProps {
  applications: DetailedApplication[];
  busy: boolean;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
}

const stages: { id: ApplicationStatus; label: string; dot: string }[] = [
  { id: 'saved', label: 'Saved', dot: 'bg-slate-400' },
  { id: 'applied', label: 'Applied', dot: 'bg-sky-500' },
  { id: 'interview', label: 'Interview', dot: 'bg-violet-500' },
  { id: 'offered', label: 'Offered', dot: 'bg-emerald-500' },
  { id: 'rejected', label: 'Closed', dot: 'bg-rose-400' },
];

export function ApplicationTracker({ applications, busy, onStatusChange }: ApplicationTrackerProps) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-500">Pipeline</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">Stay on top of every application</h2>
          <p className="mt-1 text-sm text-slate-500">Move each application forward as you hear from recruiters.</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {applications.length} active record{applications.length === 1 ? '' : 's'}
          </p>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            onClick={() => downloadApplicationsCsv(applications)}
            disabled={applications.length === 0}
          >
            <Download size={14} />Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 overflow-x-auto pb-3 lg:grid-cols-5">
        {stages.map((stage) => {
          const stageApplications = applications.filter((application) => application.status === stage.id);
          return (
            <div key={stage.id} className="min-h-52 min-w-60 rounded-2xl border border-slate-200/80 bg-white/60 p-3 lg:min-w-0">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${stage.dot}`} />{stage.label}
                </span>
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">{stageApplications.length}</span>
              </div>

              <div className="space-y-2">
                {stageApplications.map((application) => (
                  <article key={application.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest-50 text-xs font-extrabold text-forest-700">{application.drive.companyMark}</span>
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-bold text-forest-900">{application.drive.role}</h3>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">{application.drive.company}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                      <CalendarClock size={11} /> Updated {new Date(application.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <label className="mt-3 block">
                      <span className="sr-only">Update application status</span>
                      <select
                        className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-forest-500"
                        value={application.status}
                        disabled={busy}
                        onChange={(event) => onStatusChange(application.id, event.target.value as ApplicationStatus)}
                      >
                        {stages.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                  </article>
                ))}

                {stageApplications.length === 0 && (
                  <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-200 text-center">
                    <div>
                      <Building2 className="mx-auto text-slate-300" size={18} />
                      <p className="mt-2 text-[10px] font-medium text-slate-400">No applications here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-forest-100 bg-forest-50 p-4 text-xs text-forest-700">
        <ArrowRight size={16} className="shrink-0" />
        <span><strong>Tip:</strong> update a stage as soon as you receive an email so your placement timeline stays accurate.</span>
      </div>
    </section>
  );
}
