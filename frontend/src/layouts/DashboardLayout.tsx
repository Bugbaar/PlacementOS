import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Bot,
  Menu,
  X,
  LogOut,
  Sparkles,
  ListFilter,
  Building2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/studentSlice';
import { RootState, AppDispatch } from '../store';
import clsx from 'clsx';

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Opportunities', href: '/opportunities', icon: Briefcase },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Resume Fit', href: '/resume-fit', icon: Sparkles },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
];

const adminNavigation = [
  { name: 'Cell Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Shortlist Engine', href: '/shortlist', icon: ListFilter },
  { name: 'Opportunities', href: '/opportunities', icon: Briefcase },
  { name: 'Admin', href: '/profile', icon: User },
];

const recruiterNavigation = [
  { name: 'Hiring Portal', href: '/recruiter', icon: Building2 },
  { name: 'Account', href: '/profile', icon: User },
];

type ShellTone = 'student' | 'admin' | 'recruiter';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent } = useSelector((state: RootState) => state.student);

  const shell: ShellTone =
    currentStudent?.role === 'admin'
      ? 'admin'
      : currentStudent?.role === 'recruiter'
        ? 'recruiter'
        : 'student';

  const navigation = useMemo(() => {
    if (shell === 'admin') return adminNavigation;
    if (shell === 'recruiter') return recruiterNavigation;
    return studentNavigation;
  }, [shell]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const brandTitle =
    shell === 'admin' ? 'Placement Cell' : shell === 'recruiter' ? 'Recruiter' : 'PlacementOS';
  const brandSubtitle =
    shell === 'admin' ? 'Admin console' : shell === 'recruiter' ? 'Campus hiring' : null;

  const darkShell = shell === 'admin' || shell === 'recruiter';
  const accentActive =
    shell === 'admin'
      ? 'bg-teal-500/15 text-teal-200'
      : shell === 'recruiter'
        ? 'bg-amber-500/15 text-amber-200'
        : null;
  const accentIcon =
    shell === 'admin' ? 'text-teal-300' : shell === 'recruiter' ? 'text-amber-300' : null;
  const brandColor =
    shell === 'admin' ? 'text-teal-300' : shell === 'recruiter' ? 'text-amber-300' : 'text-primary';
  const avatarBg =
    shell === 'admin'
      ? 'bg-teal-500/20 text-teal-300'
      : shell === 'recruiter'
        ? 'bg-amber-500/20 text-amber-300'
        : 'bg-blue-100 text-blue-700';
  const pageBg = shell === 'admin' || shell === 'recruiter' ? 'bg-slate-100' : 'bg-gray-50';
  const sidebarBg =
    shell === 'admin' || shell === 'recruiter' ? 'bg-slate-950 text-slate-100' : 'bg-white';

  const renderNav = (mobile: boolean) =>
    navigation.map((item) => {
      const isActive = location.pathname.startsWith(item.href);
      return (
        <Link
          key={item.name}
          to={item.href}
          onClick={() => mobile && setSidebarOpen(false)}
          className={clsx(
            darkShell
              ? isActive
                ? accentActive
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              : isActive
                ? mobile
                  ? 'bg-primary/10 text-primary'
                  : 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100',
            mobile
              ? 'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              : 'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
          )}
        >
          <item.icon
            className={clsx(
              darkShell
                ? isActive
                  ? accentIcon
                  : 'text-slate-500 group-hover:text-slate-300'
                : isActive
                  ? mobile
                    ? 'text-primary'
                    : 'text-blue-700'
                  : 'text-gray-400 group-hover:text-gray-500',
              'mr-3 flex-shrink-0 h-5 w-5',
            )}
          />
          {item.name}
        </Link>
      );
    });

  return (
    <div className={clsx('min-h-screen flex', pageBg)}>
      <div className={clsx('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className={clsx('fixed inset-y-0 left-0 w-64 shadow-xl flex flex-col', sidebarBg)}>
          <div
            className={clsx(
              'h-16 flex items-center justify-between px-4 border-b',
              darkShell ? 'border-slate-800' : 'border-gray-200',
            )}
          >
            <div>
              <span className={clsx('text-xl font-bold', brandColor)}>{brandTitle}</span>
              {brandSubtitle ? (
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{brandSubtitle}</p>
              ) : null}
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className={clsx('w-6 h-6', darkShell ? 'text-slate-400' : 'text-gray-500')} />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">{renderNav(true)}</nav>
        </div>
      </div>

      <div
        className={clsx(
          'hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r shadow-sm',
          darkShell ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200',
        )}
      >
        <div
          className={clsx(
            'flex h-16 shrink-0 items-center px-6 border-b',
            darkShell ? 'border-slate-800' : 'border-gray-200',
          )}
        >
          <div>
            <span
              className={clsx(
                'text-xl font-bold',
                darkShell
                  ? brandColor
                  : 'bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent text-2xl',
              )}
            >
              {brandTitle}
            </span>
            {brandSubtitle ? (
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-0.5">
                {brandSubtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-1">{renderNav(false)}</nav>
        </div>
        <div className={clsx('p-4 border-t space-y-3', darkShell ? 'border-slate-800' : 'border-gray-200')}>
          <div className="flex items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                avatarBg,
              )}
            >
              {currentStudent?.name?.charAt(0) || (shell === 'admin' ? 'A' : shell === 'recruiter' ? 'R' : 'S')}
            </div>
            <div className="ml-3 min-w-0">
              <p
                className={clsx(
                  'text-sm font-medium truncate',
                  darkShell ? 'text-slate-100' : 'text-gray-700',
                )}
              >
                {currentStudent?.name || 'Loading...'}
              </p>
              <p className={clsx('text-xs truncate', darkShell ? 'text-slate-500' : 'text-gray-500')}>
                {shell === 'admin'
                  ? 'Placement officer'
                  : shell === 'recruiter'
                    ? 'Campus recruiter'
                    : currentStudent?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className={clsx(
              'w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm',
              darkShell
                ? 'border-slate-700 text-slate-300 hover:bg-slate-900'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-1 flex-col w-full min-h-screen">
        <div
          className={clsx(
            'sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden',
            darkShell
              ? 'bg-slate-950/95 border-slate-800 text-slate-100'
              : 'bg-white/80 backdrop-blur-md',
          )}
        >
          <button
            type="button"
            className={clsx('-m-2.5 p-2.5', darkShell ? 'text-slate-200' : 'text-gray-700')}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6">{brandTitle}</div>
          {shell === 'admin' ? (
            <span className="text-[10px] uppercase tracking-wider rounded-full bg-teal-500/20 text-teal-300 px-2 py-1">
              Admin
            </span>
          ) : shell === 'recruiter' ? (
            <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 px-2 py-1">
              Recruiter
            </span>
          ) : null}
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
