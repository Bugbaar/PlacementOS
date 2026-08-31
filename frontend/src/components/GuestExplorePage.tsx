import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarPlus,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { dashboardApi } from '../api';
import type { PlacementDrive } from '../types';
import { downloadCalendarEvent } from '../utils/downloads';

export function GuestExplorePage({ onSignIn }: { onSignIn: () => void }) {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getPublicDrives()
      .then(({ drives: opportunities }) => setDrives(opportunities))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredDrives = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return drives.filter((drive) => {
      const matchesQuery = !query || [drive.company, drive.role, drive.location, ...drive.skills]
        .some((value) => value.toLocaleLowerCase().includes(query));
      return matchesQuery && (workMode === 'all' || drive.workMode === workMode);
    });
  }, [drives, search, workMode]);

  return (
    <main className="min-h-screen bg-sand text-slate-700">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-sand/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a className="flex items-center gap-2.5" href="#top" aria-label="PlacementOS home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-900 text-[#d7f46d]"><GraduationCap size={19} /></span>
            <span className="font-display text-lg font-extrabold text-forest-900">PlacementOS</span>
          </a>
          <nav className="hidden items-center gap-6 text-xs font-bold text-slate-500 md:flex" aria-label="Guest navigation">
            <a className="hover:text-forest-700" href="#opportunities">Opportunities</a>
            <a className="hover:text-forest-700" href="#how-it-works">How it works</a>
            <a className="hover:text-forest-700" href="#platform">Platform</a>
          </nav>
          <button className="rounded-xl bg-forest-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-forest-700" onClick={onSignIn}>Student sign in</button>
        </div>
      </header>

      <section id="top" className="hero-pattern relative overflow-hidden px-5 py-16 text-white sm:px-8 sm:py-24">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/75"><Sparkles size={13} className="text-[#d7f46d]" />Explore freely. Sign in when you are ready.</span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.07] tracking-tight sm:text-6xl">Your placement journey<br /><span className="text-[#d7f46d]">starts with clarity.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Browse real opportunities as a guest. Sign in to unlock personal eligibility explanations, save roles, apply, and manage your complete placement pipeline.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 rounded-xl bg-[#d7f46d] px-5 py-3 text-sm font-bold text-forest-900 transition hover:bg-white" href="#opportunities">Explore opportunities <ArrowRight size={17} /></a>
              <button className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10" onClick={onSignIn}>Check my eligibility</button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/55">
              {['No account needed to browse', 'Explainable matching', 'One application timeline'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-[#d7f46d]" />{item}</span>)}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="rotate-2 rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d7f46d]">Opportunity preview</p><h2 className="mt-1 font-display text-xl font-extrabold">Roles worth exploring</h2></div><Target className="text-[#d7f46d]" /></div>
              <div className="mt-5 space-y-3">
                {(drives.length ? drives.slice(0, 3) : [null, null, null]).map((drive, index) => (
                  <div key={drive?.id ?? index} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                    {drive ? <><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold">{drive.role}</p><p className="mt-1 text-[11px] text-white/45">{drive.company} · {drive.workMode}</p></div><span className="rounded-full bg-[#d7f46d]/10 px-2.5 py-1 text-[10px] font-bold text-[#d7f46d]">{drive.type}</span></div></> : <div className="h-9 animate-pulse rounded-xl bg-white/10" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Search, title: 'Discover in one place', copy: 'Search curated internships and full-time roles without jumping across portals.' },
            { icon: ShieldCheck, title: 'Understand every decision', copy: 'Signed-in students see the exact CGPA, branch, year, and backlog checks behind a match.' },
            { icon: Target, title: 'Keep momentum visible', copy: 'Move saved roles through application, interview, offer, or closed stages.' },
          ].map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-700"><Icon size={20} /></span><h2 className="mt-5 font-display text-lg font-extrabold text-forest-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></article>)}
        </div>
      </section>

      <section id="opportunities" className="border-y border-slate-200/70 bg-white/55 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-500">Guest explorer</p><h2 className="mt-2 font-display text-3xl font-extrabold text-forest-900">See what is open now</h2><p className="mt-2 text-sm text-slate-500">Public role details and requirements are available before you sign in.</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative"><span className="sr-only">Search opportunities</span><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-forest-500 sm:w-64" placeholder="Search role, company, skill" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              <select aria-label="Filter by work mode" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-forest-500" value={workMode} onChange={(event) => setWorkMode(event.target.value)}><option value="all">Any work mode</option><option value="On-site">On-site</option><option value="Hybrid">Hybrid</option><option value="Remote">Remote</option></select>
            </div>
          </div>

          {loading && <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-forest-500" /><span className="sr-only">Loading opportunities</span></div>}
          {error && <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">Opportunities could not be loaded: {error}</div>}
          {!loading && !error && <>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">{filteredDrives.map((drive) => <GuestDriveCard key={drive.id} drive={drive} onSignIn={onSignIn} />)}</div>
            {filteredDrives.length === 0 && <div className="mt-8 rounded-3xl border border-dashed border-slate-300 py-16 text-center"><Search className="mx-auto text-slate-300" /><h3 className="mt-3 font-display font-extrabold text-forest-900">No opportunities match</h3><button className="mt-3 text-sm font-bold text-forest-700" onClick={() => { setSearch(''); setWorkMode('all'); }}>Clear filters</button></div>}
          </>}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="rounded-[2rem] bg-forest-900 p-7 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d7f46d]">From discovery to offer</p><h2 className="mt-2 font-display text-3xl font-extrabold">One simple student workflow</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">{[
            ['01', 'Explore', 'Browse open opportunities in guest mode.'],
            ['02', 'Sign in', 'Load your academic profile securely.'],
            ['03', 'Decide', 'Understand eligibility before applying.'],
            ['04', 'Track', 'Keep every next step in one pipeline.'],
          ].map(([number, title, copy]) => <div key={number} className="border-l border-white/15 pl-4"><span className="text-xs font-extrabold text-[#d7f46d]">{number}</span><h3 className="mt-3 font-display font-extrabold">{title}</h3><p className="mt-2 text-xs leading-5 text-white/50">{copy}</p></div>)}</div>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7"><p className="text-sm text-white/60">Ready to see which roles fit your profile?</p><button className="inline-flex items-center gap-2 rounded-xl bg-[#d7f46d] px-5 py-3 text-sm font-bold text-forest-900" onClick={onSignIn}>Sign in to continue <ArrowRight size={16} /></button></div>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 px-5 py-7 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-400"><span className="font-display font-bold text-forest-900">PlacementOS</span><span>Transparent placement decisions for every student.</span></div></footer>
    </main>
  );
}

function GuestDriveCard({ drive, onSignIn }: { drive: PlacementDrive; onSignIn: () => void }) {
  const closingDate = new Date(drive.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:p-6">
    <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-50 font-display text-lg font-extrabold text-forest-700">{drive.companyMark}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-semibold text-slate-500">{drive.company}</p><h3 className="mt-1 font-display text-lg font-extrabold text-forest-900">{drive.role}</h3></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{drive.type}</span></div><div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={13} />{drive.location} · {drive.workMode}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={13} />{drive.salary}</span></div></div></div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{drive.description}</p>
    <div className="mt-4 flex flex-wrap gap-2">{drive.skills.map((skill) => <span key={skill} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{skill}</span>)}</div>
    <div className="mt-5 grid gap-2 rounded-2xl bg-forest-50/70 p-3 text-[11px] font-semibold text-forest-700 sm:grid-cols-3"><span>CGPA {drive.eligibility.minCgpa}+</span><span>{drive.eligibility.maxActiveBacklogs ?? 0} backlog max</span><span className="inline-flex items-center gap-1"><UsersRound size={12} />{drive.openings} openings</span></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-coral">Closes {closingDate}</span><div className="flex items-center gap-2"><button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-forest-500 hover:text-forest-700" onClick={() => downloadCalendarEvent(drive)} aria-label={`Add ${drive.role} deadline to calendar`} title="Add deadline to calendar"><CalendarPlus size={16} /></button><button className="rounded-xl bg-forest-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-forest-700" onClick={onSignIn}>Sign in to check eligibility</button></div></div>
  </article>;
}
