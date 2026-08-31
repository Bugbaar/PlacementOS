import { BriefcaseBusiness, CheckCircle2, MessagesSquare, Trophy } from 'lucide-react';
import type { DashboardData } from '../types';

export function StatCards({ stats }: { stats: DashboardData['stats'] }) {
  const items = [
    { label: 'Eligible drives', value: stats.eligibleDrives, note: 'Matched to your profile', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-700' },
    { label: 'Applications', value: stats.totalApplications, note: 'Across all active drives', icon: BriefcaseBusiness, style: 'bg-sky-50 text-sky-700' },
    { label: 'Interviews', value: stats.interviews, note: stats.interviews ? 'Preparation matters now' : 'Keep applying', icon: MessagesSquare, style: 'bg-violet-50 text-violet-700' },
    { label: 'Offers', value: stats.offers, note: stats.offers ? 'Congratulations!' : 'Your next milestone', icon: Trophy, style: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Placement summary">
      {items.map(({ label, value, note, icon: Icon, style }) => (
        <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-forest-900">{value}</p>
            </div>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${style}`}><Icon size={17} /></span>
          </div>
          <p className="mt-3 truncate text-[11px] font-medium text-slate-400">{note}</p>
        </article>
      ))}
    </section>
  );
}

