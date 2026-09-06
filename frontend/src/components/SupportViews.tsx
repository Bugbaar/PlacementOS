import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  BarChart3,
  BellRing,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  LogOut,
  Mail,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import type { DashboardData, DetailedApplication, DriveWithDecision, Student } from '../types';

export function AnalyticsView({ data }: { data: DashboardData }) {
  const eligiblePercent = data.drives.length
    ? Math.round((data.stats.eligibleDrives / data.drives.length) * 100)
    : 0;
  const stages = [
    { label: 'Saved', count: data.applications.filter((item) => item.status === 'saved').length, color: 'bg-slate-400' },
    { label: 'Applied', count: data.applications.filter((item) => item.status === 'applied').length, color: 'bg-sky-500' },
    { label: 'Interview', count: data.applications.filter((item) => item.status === 'interview').length, color: 'bg-violet-500' },
    { label: 'Offered', count: data.applications.filter((item) => item.status === 'offered').length, color: 'bg-emerald-500' },
  ];
  const maxCount = Math.max(1, ...stages.map((stage) => stage.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard icon={Target} label="Eligibility rate" value={`${eligiblePercent}%`} note={`${data.stats.eligibleDrives} of ${data.drives.length} active drives`} tone="emerald" />
        <InsightCard icon={BarChart3} label="Interview rate" value={`${data.stats.totalApplications ? Math.round((data.stats.interviews / data.stats.totalApplications) * 100) : 0}%`} note={`${data.stats.interviews} interviews from ${data.stats.totalApplications} applications`} tone="violet" />
        <InsightCard icon={Trophy} label="Offer conversion" value={`${data.stats.totalApplications ? Math.round((data.stats.offers / data.stats.totalApplications) * 100) : 0}%`} note="Updates as your pipeline moves" tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-500">Application funnel</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-forest-900">Pipeline distribution</h2>
          <div className="mt-7 space-y-5">
            {stages.map((stage) => (
              <div key={stage.label}>
                <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-slate-600">{stage.label}</span><span className="font-bold text-forest-900">{stage.count}</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${stage.color}`} style={{ width: `${(stage.count / maxCount) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-forest-900 p-6 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d7f46d]">Profile insight</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">Your strongest signals</h2>
          <div className="mt-6 space-y-3">
            {[`CGPA ${data.student.cgpa.toFixed(1)}`, `${data.student.skills.length} listed skills`, `${data.student.activeBacklogs} active backlogs`].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm text-white/75"><CheckCircle2 size={16} className="text-[#d7f46d]" />{item}</div>)}
          </div>
          <p className="mt-6 text-xs leading-5 text-white/45">Analytics use current demo data and update immediately when your profile or application stages change.</p>
        </section>
      </div>
    </div>
  );
}

export function HelpView() {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const faqs = [
    { question: 'How is my eligibility calculated?', answer: 'PlacementOS checks CGPA, branch, graduation year, and active backlogs against the rules provided for each drive. Expand any drive card to see every result.' },
    { question: 'Are skills hard eligibility requirements?', answer: 'No. Skills are displayed as matches and preparation gaps, but only the recruiter’s academic criteria determine eligibility in this MVP.' },
    { question: 'Can I edit an application stage?', answer: 'Yes. Open My applications and use the status selector on any application card to move it through the pipeline.' },
    { question: 'Why does my data reset after a restart?', answer: 'This evaluation build uses in-memory demo data. Persistent MongoDB storage is the next production step.' },
  ];
  const filtered = faqs.filter((item) => item.question.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); setMessage(''); };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-700"><CircleHelp size={20} /></span><div><h2 className="font-display text-xl font-extrabold text-forest-900">Frequently asked questions</h2><p className="mt-1 text-sm text-slate-500">Quick answers for the student workspace.</p></div></div>
        <label className="relative mt-6 block"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-forest-500" placeholder="Search help topics" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="mt-5 space-y-2">
          {filtered.map((item) => <details key={item.question} className="group rounded-xl border border-slate-200 bg-white p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-forest-900">{item.question}<ChevronDown className="shrink-0 transition group-open:rotate-180" size={16} /></summary><p className="mt-3 text-sm leading-6 text-slate-500">{item.answer}</p></details>)}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No help topic matches that search.</p>}
        </div>
      </section>

      <form className="h-fit rounded-3xl bg-forest-900 p-6 text-white shadow-soft" onSubmit={submit}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d7f46d] text-forest-900"><Mail size={18} /></span>
        <h2 className="mt-6 font-display text-xl font-extrabold">Still need help?</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">Send a demo support request. No external message is sent in this MVP.</p>
        <textarea className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.07] p-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7f46d]" rows={4} required placeholder="Describe your question…" value={message} onChange={(event) => { setMessage(event.target.value); setSubmitted(false); }} />
        <button className="mt-3 w-full rounded-xl bg-[#d7f46d] py-3 text-sm font-bold text-forest-900 hover:bg-white">Submit request</button>
        {submitted && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#d7f46d]"><Check size={14} />Request saved for this demo session.</p>}
      </form>
    </div>
  );
}

const defaultPreferences: Record<string, boolean> = {
  emailAlerts: true,
  deadlineReminders: true,
  profileVisible: true,
};

export function SettingsView({ student, onLogout }: { student: Student; onLogout: () => void }) {
  const storageKey = `placementos.settings.${student.id}`;
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return { ...defaultPreferences };
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        const merged: Record<string, boolean> = { ...defaultPreferences };
        for (const [key, defaultValue] of Object.entries(defaultPreferences)) {
          merged[key] = typeof parsed[key] === 'boolean' ? parsed[key] : defaultValue;
        }
        return merged;
      }
      return { ...defaultPreferences };
    } catch {
      return { ...defaultPreferences };
    }
  });
  const [saved, setSaved] = useState(false);
  const toggle = (key: string) => { setPreferences((current) => ({ ...current, [key]: !current[key] })); setSaved(false); };
  const save = () => { localStorage.setItem(storageKey, JSON.stringify(preferences)); setSaved(true); };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-700"><Settings2 size={20} /></span><div><h2 className="font-display text-xl font-extrabold text-forest-900">Notification & privacy preferences</h2><p className="mt-1 text-sm text-slate-500">These settings are saved separately for {student.name}.</p></div></div>
        <div className="mt-7 divide-y divide-slate-100">
          <SettingRow label="Email alerts" description="Updates when a drive or application changes" enabled={preferences.emailAlerts} onToggle={() => toggle('emailAlerts')} />
          <SettingRow label="Deadline reminders" description="Remind me before eligible drives close" enabled={preferences.deadlineReminders} onToggle={() => toggle('deadlineReminders')} />
          <SettingRow label="Recruiter profile visibility" description="Allow approved recruiters to discover my profile" enabled={preferences.profileVisible} onToggle={() => toggle('profileVisible')} />
        </div>
        <div className="mt-6 flex items-center justify-end gap-3"><span className={`text-xs font-semibold text-emerald-600 transition ${saved ? 'opacity-100' : 'opacity-0'}`}>Preferences saved</span><button className="rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-forest-700" onClick={save}>Save settings</button></div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><ShieldCheck className="text-forest-500" /><h3 className="mt-4 font-display font-extrabold text-forest-900">Account</h3><p className="mt-2 text-xs leading-5 text-slate-500">Signed in as<br /><strong className="text-slate-700">{student.email}</strong></p></div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5"><h3 className="font-display font-extrabold text-rose-800">End demo session</h3><p className="mt-2 text-xs leading-5 text-rose-600">Return to the sign-in page and choose another student account.</p><button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200" onClick={onLogout}><LogOut size={14} />Sign out</button></div>
      </aside>
    </div>
  );
}

export function NotificationsPanel({ applications, drives, onClose, onMarkRead }: { applications: DetailedApplication[]; drives: DriveWithDecision[]; onClose: () => void; onMarkRead: () => void }) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const items = useMemo(() => {
    const interview = applications.find((item) => item.status === 'interview');
    const deadline = [...drives].filter((drive) => !drive.application).sort((a, b) => a.closingDate.localeCompare(b.closingDate))[0];
    return [
      interview && { title: 'Interview stage reached', detail: `${interview.drive.company} · ${interview.drive.role}`, icon: Trophy, tone: 'bg-violet-50 text-violet-700' },
      deadline && { title: 'Upcoming application deadline', detail: `${deadline.company} closes ${new Date(deadline.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
      { title: 'Eligibility results refreshed', detail: `${drives.filter((drive) => drive.eligibilityDecision.eligible).length} drives match your current profile`, icon: BellRing, tone: 'bg-emerald-50 text-emerald-700' },
    ].filter(Boolean) as { title: string; detail: string; icon: typeof Trophy; tone: string }[];
  }, [applications, drives]);

  return (
    <div className="fixed inset-0 z-50 bg-forest-900/25 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside ref={panelRef} tabIndex={-1} className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl outline-none sm:p-7" role="dialog" aria-modal="true" aria-label="Notifications">
        <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-500">Updates</p><h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">Notifications</h2></div><button className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500" onClick={onClose} aria-label="Close notifications"><X size={17} /></button></div>
        <div className="mt-7 space-y-3">{items.map(({ title, detail, icon: Icon, tone }) => <article key={title} className="flex gap-3 rounded-2xl border border-slate-200 p-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon size={17} /></span><div><h3 className="text-sm font-bold text-forest-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div></article>)}</div>
        <button className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:border-forest-500 hover:text-forest-700" onClick={() => { onMarkRead(); onClose(); }}>Mark all as read</button>
      </aside>
    </div>
  );
}

function SettingRow({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: () => void }) {
  return <div className="flex items-center justify-between gap-4 py-5"><div><h3 className="text-sm font-bold text-forest-900">{label}</h3><p className="mt-1 text-xs text-slate-500">{description}</p></div><button role="switch" aria-checked={enabled} aria-label={label} className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? 'bg-forest-500' : 'bg-slate-200'}`} onClick={onToggle}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? 'left-6' : 'left-1'}`} /></button></div>;
}

function InsightCard({ icon: Icon, label, value, note, tone }: { icon: typeof Target; label: string; value: string; note: string; tone: 'emerald' | 'violet' | 'amber' }) {
  const styles = { emerald: 'bg-emerald-50 text-emerald-700', violet: 'bg-violet-50 text-violet-700', amber: 'bg-amber-50 text-amber-700' };
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className={`grid h-10 w-10 place-items-center rounded-xl ${styles[tone]}`}><Icon size={18} /></span><p className="mt-5 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-display text-3xl font-extrabold text-forest-900">{value}</p><p className="mt-2 text-[11px] text-slate-400">{note}</p></article>;
}

