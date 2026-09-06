import { useState } from 'react';
import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  Clock3,
  IndianRupee,
  MapPin,
  UsersRound,
  X,
} from 'lucide-react';
import type { DriveWithDecision } from '../types';
import { downloadCalendarEvent } from '../utils/downloads';

interface DriveCardProps {
  drive: DriveWithDecision;
  busy: boolean;
  onApply: (driveId: string) => void;
  onSave: (driveId: string) => void;
}

const markStyles: Record<string, string> = {
  N: 'bg-violet-100 text-violet-700',
  A: 'bg-sky-100 text-sky-700',
  P: 'bg-orange-100 text-orange-700',
  C: 'bg-emerald-100 text-emerald-700',
  V: 'bg-pink-100 text-pink-700',
};

function deadlineLabel(closingDate: string) {
  const milliseconds = new Date(closingDate).getTime() - Date.now();
  if (milliseconds <= 0) return { text: 'Closed', urgent: true, closed: true };
  const days = Math.ceil(milliseconds / 86_400_000);
  if (days === 0) return { text: 'Closes today', urgent: true, closed: false };
  return { text: `${days} day${days === 1 ? '' : 's'} left`, urgent: days <= 3, closed: false };
}

export function DriveCard({ drive, busy, onApply, onSave }: DriveCardProps) {
  const [showDecision, setShowDecision] = useState(false);
  const deadline = deadlineLabel(drive.closingDate);
  const decision = drive.eligibilityDecision;
  const applicationLabel = drive.application
    ? drive.application.status.charAt(0).toUpperCase() + drive.application.status.slice(1)
    : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-forest-100 hover:shadow-soft">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold ${markStyles[drive.companyMark] ?? 'bg-slate-100 text-slate-700'}`}>
            {drive.companyMark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">{drive.company}</p>
                <h3 className="mt-0.5 font-display text-lg font-bold leading-tight text-forest-900">
                  {drive.role}
                </h3>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${decision.eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {decision.eligible ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                {decision.eligible ? 'Eligible' : 'Not eligible'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{drive.location} · {drive.workMode}</span>
              <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} />{drive.type}</span>
              <span className="inline-flex items-center gap-1.5"><IndianRupee size={14} />{drive.salary.replace('₹', '')}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{drive.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {drive.skills.map((skill) => (
            <span key={skill} className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${decision.matchedSkills.includes(skill) ? 'bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-100' : 'bg-slate-50 text-slate-500'}`}>
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span className={`inline-flex items-center gap-1.5 ${deadline.urgent ? 'text-coral' : ''}`}>
              <Clock3 size={14} />{deadline.text}
            </span>
            <span className="inline-flex items-center gap-1.5"><UsersRound size={14} />{drive.openings} openings</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-forest-500 hover:text-forest-700"
              onClick={() => downloadCalendarEvent(drive)}
              aria-label={`Add ${drive.role} deadline to calendar`}
              title="Add deadline to calendar"
            >
              <CalendarPlus size={16} />
            </button>
            {!drive.application && (
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-forest-500 hover:text-forest-700 disabled:opacity-40"
                onClick={() => onSave(drive.id)}
                disabled={busy || deadline.closed}
                aria-label={`Save ${drive.role}`}
              >
                <Bookmark size={16} />
              </button>
            )}
            {applicationLabel ? (
              <span className="rounded-xl bg-forest-50 px-4 py-2 text-xs font-bold text-forest-700 ring-1 ring-inset ring-forest-100">
                {applicationLabel}
              </span>
            ) : (
              <button
                className="rounded-xl bg-forest-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                onClick={() => onApply(drive.id)}
                disabled={busy || !decision.eligible || deadline.closed}
              >
                {busy ? 'Updating…' : decision.eligible ? 'Apply now' : 'Review criteria'}
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-left text-xs font-semibold text-slate-600 transition hover:bg-forest-50 sm:px-6"
        onClick={() => setShowDecision((value) => !value)}
        aria-expanded={showDecision}
      >
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={14} className="text-forest-500" />
          Why am I {decision.eligible ? 'eligible' : 'not eligible'}? · {decision.score}% criteria match
        </span>
        <ChevronDown size={15} className={`transition ${showDecision ? 'rotate-180' : ''}`} />
      </button>

      {showDecision && (
        <div className="grid gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-2 sm:px-6">
          {decision.checks.map((check) => (
            <div key={check.key} className="flex items-start gap-2 rounded-xl bg-white p-3 text-xs ring-1 ring-slate-100">
              <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${check.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {check.passed ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
              </span>
              <span>
                <span className="block font-bold text-slate-700">{check.label}</span>
                <span className="mt-0.5 block leading-4 text-slate-500">{check.message}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
