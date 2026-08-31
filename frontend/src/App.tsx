import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, Search, Sparkles, X } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { ApplicationTracker } from './components/ApplicationTracker';
import { DriveCard } from './components/DriveCard';
import { GuestExplorePage } from './components/GuestExplorePage';
import { LoginPage } from './components/LoginPage';
import { ProfileEditor } from './components/ProfileEditor';
import { StatCards } from './components/StatCards';
import { AnalyticsView, HelpView, NotificationsPanel, SettingsView } from './components/SupportViews';
import { clearNotice, createApplication, fetchDashboard, resetDashboard, updateApplication, updateStudent } from './features/dashboardSlice';
import type { AppDispatch, RootState } from './store';
import type { ApplicationStatus, DashboardView, DriveWithDecision, Student, UserSession } from './types';

const SESSION_KEY = 'placementos.session';

function readSession(): UserSession | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) as UserSession : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, actionId, error, notice } = useSelector((state: RootState) => state.dashboard);
  const [session, setSession] = useState<UserSession | null>(readSession);
  const [showLogin, setShowLogin] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [search, setSearch] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible'>('all');
  const [workMode, setWorkMode] = useState('all');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  useEffect(() => {
    if (session) void dispatch(fetchDashboard(session.studentId));
  }, [dispatch, session]);
  useEffect(() => {
    if (!notice && !error) return;
    const timer = window.setTimeout(() => dispatch(clearNotice()), 4500);
    return () => window.clearTimeout(timer);
  }, [dispatch, notice, error]);

  const filteredDrives = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLocaleLowerCase();
    return data.drives.filter((drive) => {
      const matchesSearch = !query || [drive.role, drive.company, drive.location, ...drive.skills].some((value) => value.toLocaleLowerCase().includes(query));
      const matchesEligibility = eligibilityFilter === 'all' || drive.eligibilityDecision.eligible;
      const matchesMode = workMode === 'all' || drive.workMode === workMode;
      return matchesSearch && matchesEligibility && matchesMode;
    });
  }, [data, search, eligibilityFilter, workMode]);

  if (!session) {
    if (!showLogin) return <GuestExplorePage onSignIn={() => setShowLogin(true)} />;
    return <LoginPage onBack={() => setShowLogin(false)} onLogin={(nextSession) => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setShowLogin(false);
      setNotificationsRead(false);
    }} />;
  }

  if (loading && !data) return <LoadingScreen />;
  if (!data) return <ErrorScreen error={error} onRetry={() => void dispatch(fetchDashboard(session.studentId))} />;

  const apply = (driveId: string) => void dispatch(createApplication({ studentId: session.studentId, driveId, status: 'applied' }));
  const save = (driveId: string) => void dispatch(createApplication({ studentId: session.studentId, driveId, status: 'saved' }));
  const changeStatus = (applicationId: string, status: ApplicationStatus) => void dispatch(updateApplication({ studentId: session.studentId, applicationId, status }));
  const saveProfile = (changes: Partial<Student>) => void dispatch(updateStudent({ studentId: session.studentId, changes }));
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    dispatch(resetDashboard());
    setSession(null);
    setShowLogin(false);
    setActiveView('overview');
    setSearch('');
    setNotificationsOpen(false);
  };

  return (
    <AppShell activeView={activeView} studentName={data.student.name} search={search} onNavigate={setActiveView} onSearch={setSearch} onLogout={logout} onNotifications={() => setNotificationsOpen(true)} notificationCount={notificationsRead ? 0 : Math.min(3, data.applications.length + 1)}>
      {(error || notice) && <Toast error={error} notice={notice} onDismiss={() => dispatch(clearNotice())} />}
      {activeView === 'overview' && <Overview data={data} busyId={actionId} onApply={apply} onSave={save} onNavigate={setActiveView} />}
      {activeView === 'drives' && (
        <DriveExplorer drives={filteredDrives} total={data.drives.length} busyId={actionId} search={search} eligibilityFilter={eligibilityFilter} workMode={workMode} onSearch={setSearch} onEligibilityFilter={setEligibilityFilter} onWorkMode={setWorkMode} onApply={apply} onSave={save} />
      )}
      {activeView === 'applications' && <ApplicationTracker applications={data.applications} busy={Boolean(actionId)} onStatusChange={changeStatus} />}
      {activeView === 'profile' && <ProfileEditor student={data.student} eligibleCount={data.stats.eligibleDrives} totalDrives={data.drives.length} saving={actionId === 'profile'} onSave={saveProfile} />}
      {activeView === 'analytics' && <AnalyticsView data={data} />}
      {activeView === 'help' && <HelpView />}
      {activeView === 'settings' && <SettingsView student={data.student} onLogout={logout} />}
      {notificationsOpen && <NotificationsPanel applications={data.applications} drives={data.drives} onClose={() => setNotificationsOpen(false)} onMarkRead={() => setNotificationsRead(true)} />}
    </AppShell>
  );
}

function Overview({ data, busyId, onApply, onSave, onNavigate }: {
  data: NonNullable<RootState['dashboard']['data']>;
  busyId: string | null;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
  onNavigate: (view: DashboardView) => void;
}) {
  const firstName = data.student.name.split(' ')[0];
  const greeting = getTimeGreeting();
  const recommended = data.drives.filter((drive) => drive.eligibilityDecision.eligible && !drive.application).slice(0, 2);
  const nextDeadline = [...data.drives].filter((drive) => !drive.application).sort((a, b) => a.closingDate.localeCompare(b.closingDate))[0];

  return (
    <div className="space-y-6">
      <section className="hero-pattern relative overflow-hidden rounded-3xl bg-forest-900 px-5 py-7 text-white shadow-soft sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/75"><Sparkles size={13} className="text-[#d7f46d]" />Eligibility engine is up to date</div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{greeting}, {firstName}.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">You match {data.stats.eligibleDrives} active drives. Review the best fits and keep your application pipeline moving.</p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d7f46d] px-4 py-2.5 text-sm font-bold text-forest-900 transition hover:bg-white" onClick={() => onNavigate('drives')}>Explore matching drives <ArrowRight size={16} /></button>
        </div>
        <div className="absolute -bottom-14 -right-8 hidden h-64 w-64 rounded-full border-[38px] border-white/[0.04] sm:block" />
        <div className="absolute right-24 top-8 hidden h-20 w-20 rounded-full border border-[#d7f46d]/20 xl:block" />
      </section>

      <StatCards stats={data.stats} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.7fr)]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-500">Recommended for you</p><h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">Strongest matches</h2></div>
            <button className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-500" onClick={() => onNavigate('drives')}>View all <ChevronRight size={15} /></button>
          </div>
          <div className="space-y-4">
            {recommended.map((drive) => <DriveCard key={drive.id} drive={drive} busy={busyId === drive.id} onApply={onApply} onSave={onSave} />)}
            {recommended.length === 0 && <EmptyMatches onNavigate={() => onNavigate('applications')} />}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-700"><CheckCircle2 size={18} /></span><span className="text-xs font-bold text-forest-500">{data.student.profileCompletion}% complete</span></div>
            <h3 className="mt-5 font-display text-lg font-extrabold text-forest-900">Your eligibility profile</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{data.student.program} · {data.student.branch}<br />CGPA {data.student.cgpa.toFixed(1)} · Class of {data.student.graduationYear}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest-500" style={{ width: `${data.student.profileCompletion}%` }} /></div>
            <button className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:border-forest-500 hover:text-forest-700" onClick={() => onNavigate('profile')}>Review profile</button>
          </div>
          {nextDeadline && <DeadlineCard drive={nextDeadline} />}
        </aside>
      </div>
    </div>
  );
}

function DeadlineCard({ drive }: { drive: DriveWithDecision }) {
  return (
    <div className="rounded-2xl bg-[#f2e6dc] p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 text-coral"><CalendarDays size={18} /></span>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-coral">Next deadline</p>
      <h3 className="mt-1 font-display text-base font-extrabold text-forest-900">{drive.role}</h3>
      <p className="mt-1 text-xs text-slate-600">{drive.company}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-coral"><Clock3 size={14} />{new Date(drive.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
    </div>
  );
}

function DriveExplorer({ drives, total, busyId, search, eligibilityFilter, workMode, onSearch, onEligibilityFilter, onWorkMode, onApply, onSave }: {
  drives: DriveWithDecision[]; total: number; busyId: string | null; search: string; eligibilityFilter: 'all' | 'eligible'; workMode: string;
  onSearch: (value: string) => void; onEligibilityFilter: (value: 'all' | 'eligible') => void; onWorkMode: (value: string) => void; onApply: (id: string) => void; onSave: (id: string) => void;
}) {
  const clearFilters = () => { onSearch(''); onEligibilityFilter('all'); onWorkMode('all'); };
  return (
    <section>
      <div className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-500">Curated opportunities</p><h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">Find your next role</h2><p className="mt-1 text-sm text-slate-500">Every eligibility decision includes the exact reason behind it.</p></div>
          <label className="relative block sm:hidden"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest-500" placeholder="Search drives" value={search} onChange={(event) => onSearch(event.target.value)} /></label>
          <div className="flex flex-wrap gap-2">
            <button className={`rounded-xl px-3 py-2 text-xs font-bold ${eligibilityFilter === 'all' ? 'bg-forest-900 text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => onEligibilityFilter('all')}>All drives</button>
            <button className={`rounded-xl px-3 py-2 text-xs font-bold ${eligibilityFilter === 'eligible' ? 'bg-forest-900 text-white' : 'bg-slate-100 text-slate-600'}`} onClick={() => onEligibilityFilter('eligible')}>Eligible only</button>
            <select className="rounded-xl border-0 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-forest-100" value={workMode} onChange={(event) => onWorkMode(event.target.value)}><option value="all">Any work mode</option><option value="On-site">On-site</option><option value="Hybrid">Hybrid</option><option value="Remote">Remote</option></select>
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Showing {drives.length} of {total} drives</span><span>Sorted by deadline</span></div>
      <div className="grid gap-4 2xl:grid-cols-2">{drives.map((drive) => <DriveCard key={drive.id} drive={drive} busy={busyId === drive.id} onApply={onApply} onSave={onSave} />)}</div>
      {drives.length === 0 && <NoDrives onClear={clearFilters} />}
    </section>
  );
}

function Toast({ error, notice, onDismiss }: { error: string | null; notice: string | null; onDismiss: () => void }) {
  return <div className={`fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 text-sm shadow-2xl sm:right-7 ${error ? 'border-rose-100 text-rose-700' : 'border-emerald-100 text-emerald-700'}`} role="status">{error ? <X className="mt-0.5 shrink-0" size={16} /> : <CheckCircle2 className="mt-0.5 shrink-0" size={16} />}<span className="font-medium">{error ?? notice}</span><button className="ml-2 opacity-50 hover:opacity-100" onClick={onDismiss} aria-label="Dismiss message"><X size={14} /></button></div>;
}

function ErrorScreen({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return <div className="grid min-h-screen place-items-center bg-sand p-6 text-center"><div className="max-w-sm rounded-3xl bg-white p-8 shadow-soft"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><X /></div><h1 className="mt-5 font-display text-xl font-extrabold text-forest-900">Dashboard unavailable</h1><p className="mt-2 text-sm leading-6 text-slate-500">{error ?? 'The PlacementOS API could not be reached.'}</p><button className="mt-5 rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-bold text-white" onClick={onRetry}>Try again</button></div></div>;
}

function EmptyMatches({ onNavigate }: { onNavigate: () => void }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-500" /><h3 className="mt-3 font-display font-extrabold text-forest-900">You are all caught up</h3><p className="mt-1 text-sm text-slate-500">Every eligible drive is already in your pipeline.</p><button className="mt-3 text-xs font-bold text-forest-700" onClick={onNavigate}>View applications</button></div>;
}

function NoDrives({ onClear }: { onClear: () => void }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 py-16 text-center"><Search className="mx-auto text-slate-300" size={28} /><h3 className="mt-4 font-display text-lg font-extrabold text-forest-900">No drives match these filters</h3><p className="mt-1 text-sm text-slate-500">Try a different keyword or show all opportunities.</p><button className="mt-4 text-sm font-bold text-forest-700" onClick={onClear}>Clear filters</button></div>;
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-sand"><div className="text-center"><div className="mx-auto grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-forest-900 text-[#d7f46d]"><Sparkles /></div><p className="mt-4 font-display text-sm font-extrabold text-forest-900">Preparing your dashboard…</p></div></div>;
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
