import type { ReactNode } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';
import type { DashboardView } from '../types';

interface AppShellProps {
  activeView: DashboardView;
  studentName: string;
  search: string;
  onNavigate: (view: DashboardView) => void;
  onSearch: (value: string) => void;
  onLogout: () => void;
  onNotifications: () => void;
  notificationCount: number;
  children: ReactNode;
}

const navigation = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'drives' as const, label: 'Placement drives', icon: BriefcaseBusiness },
  { id: 'applications' as const, label: 'My applications', icon: ClipboardCheck },
  { id: 'profile' as const, label: 'Eligibility profile', icon: UserRound },
];

const titles: Record<DashboardView, { eyebrow: string; title: string }> = {
  overview: { eyebrow: 'Student workspace', title: 'Your placement dashboard' },
  drives: { eyebrow: 'Opportunity hub', title: 'Placement drives' },
  applications: { eyebrow: 'Your progress', title: 'Application tracker' },
  profile: { eyebrow: 'Eligibility', title: 'Academic profile' },
  analytics: { eyebrow: 'Performance', title: 'Placement analytics' },
  help: { eyebrow: 'Support', title: 'Help centre' },
  settings: { eyebrow: 'Preferences', title: 'Settings' },
};

const supportNavigation = [
  { id: 'analytics' as const, label: 'Analytics', icon: ChartNoAxesColumnIncreasing },
  { id: 'help' as const, label: 'Help centre', icon: CircleHelp },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function AppShell({
  activeView,
  studentName,
  search,
  onNavigate,
  onSearch,
  onLogout,
  onNotifications,
  notificationCount,
  children,
}: AppShellProps) {
  const firstName = studentName.split(' ')[0];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="hidden min-h-screen flex-col bg-forest-900 px-5 py-7 text-white lg:flex">
        <button
          className="mb-10 flex items-center gap-3 px-2 text-left"
          onClick={() => onNavigate('overview')}
          aria-label="Go to dashboard"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d7f46d] text-forest-900 shadow-lg shadow-black/10">
            <Building2 size={21} strokeWidth={2.4} />
          </span>
          <span>
            <span className="block font-display text-lg font-extrabold tracking-tight">PlacementOS</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Student portal
            </span>
          </span>
        </button>

        <nav className="space-y-1" aria-label="Primary navigation">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Workspace
          </p>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                activeView === id
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-white/65 hover:bg-white/[0.08] hover:text-white'
              }`}
              onClick={() => onNavigate(id)}
              aria-current={activeView === id ? 'page' : undefined}
            >
              <Icon size={18} />
              {label}
              {id === 'applications' && (
                <span className="ml-auto rounded-full bg-[#d7f46d] px-2 py-0.5 text-[10px] font-bold text-forest-900">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Support
          </p>
          {supportNavigation.map(
            ({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${activeView === id ? 'bg-white text-forest-900' : 'text-white/55 hover:bg-white/[0.08] hover:text-white'}`}
                type="button"
                onClick={() => onNavigate(id)}
              >
                <Icon size={18} />
                {label}
              </button>
            ),
          )}
        </div>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-coral font-bold text-white">
              {studentName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{studentName}</span>
              <span className="block text-xs text-white/45">Student account</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg bg-white/10 py-2 text-xs font-semibold text-white/70 hover:bg-white/15" onClick={() => onNavigate('profile')}>Profile</button>
            <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2 text-xs font-semibold text-white/70 hover:bg-white/15" onClick={onLogout}><LogOut size={12} />Sign out</button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-sand/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-500">
              {titles[activeView].eyebrow}
            </p>
            <h1 className="font-display text-lg font-extrabold tracking-tight text-forest-900 sm:text-xl">
              {titles[activeView].title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <label className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <span className="sr-only">Search placement drives</span>
              <input
                className="w-56 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                placeholder="Search roles or companies"
                value={search}
                onChange={(event) => {
                  onSearch(event.target.value);
                  if (event.target.value) onNavigate('drives');
                }}
              />
            </label>
            <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-forest-700" aria-label="Notifications" onClick={onNotifications}>
              <Bell size={18} />
              {notificationCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[9px] font-bold text-white ring-2 ring-sand">{notificationCount}</span>}
            </button>
            <button className="hidden items-center gap-2 rounded-xl bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold shadow-sm sm:flex" onClick={() => onNavigate('profile')}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-100 text-xs font-bold text-forest-700">
                {firstName[0]}
              </span>
              {firstName}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-6 sm:px-7 lg:px-10 lg:pb-10">{children}</main>

        <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
          {[...navigation, { id: 'settings' as const, label: 'Settings', icon: Settings }].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold ${activeView === id ? 'bg-forest-900 text-white' : 'text-slate-500'}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={17} />
              <span className="max-w-full truncate px-1">{label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
