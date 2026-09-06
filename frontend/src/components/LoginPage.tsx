import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, GraduationCap, LoaderCircle, LockKeyhole, Sparkles } from 'lucide-react';
import { dashboardApi } from '../api';
import type { DemoUser, UserSession } from '../types';

export function LoginPage({ onBack, onLogin }: { onBack: () => void; onLogin: (session: UserSession) => void }) {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('placement123');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getDemoUsers()
      .then(({ users: availableUsers }) => {
        setUsers(availableUsers);
        setEmail(availableUsers[0]?.email ?? '');
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await dashboardApi.login(email, password);
      onLogin(result.session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#eef3ef] lg:grid-cols-[1.05fr_.95fr]">
      <section className="hero-pattern relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:p-16">
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d7f46d] text-forest-900"><GraduationCap size={22} /></span>
          <div><p className="font-display text-xl font-extrabold">PlacementOS</p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Student portal</p></div>
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70"><Sparkles size={13} className="text-[#d7f46d]" />Your placement journey, clearly mapped</span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.08] tracking-tight xl:text-6xl">Find the right role.<br /><span className="text-[#d7f46d]">Know why you match.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/60">One workspace to discover opportunities, verify eligibility, and move every application forward.</p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            {['Explainable matches', 'Live application tracker', 'Private student profile'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-xs font-semibold text-white/70"><Check className="mb-3 text-[#d7f46d]" size={16} />{item}</div>)}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/35">Built for students, placement cells, and recruiters.</p>
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[55px] border-white/[0.035]" />
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-900 text-[#d7f46d]"><GraduationCap size={20} /></span><span className="font-display text-xl font-extrabold text-forest-900">PlacementOS</span></div>
            <button className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-700 lg:ml-auto" type="button" onClick={onBack}><ArrowLeft size={15} />Back to guest explorer</button>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-500">Student access</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-forest-900 sm:text-4xl">Sign in to personalize</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Choose a seeded student profile to experience personal eligibility and application tracking.</p>

          <form className="mt-7" onSubmit={submit}>
            <fieldset disabled={loading || submitting}>
              <legend className="mb-3 text-xs font-bold text-slate-700">Choose a student profile</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {loading && [1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/70" />)}
                {users.map((user) => {
                  const selected = email === user.email;
                  return (
                    <button key={user.id} type="button" onClick={() => setEmail(user.email)} className={`relative rounded-2xl border p-3 text-left transition ${selected ? 'border-forest-500 bg-white shadow-sm ring-2 ring-forest-100' : 'border-white bg-white/60 hover:border-slate-200 hover:bg-white'}`}>
                      <span className={`mb-3 grid h-8 w-8 place-items-center rounded-lg text-xs font-extrabold ${selected ? 'bg-forest-900 text-[#d7f46d]' : 'bg-slate-100 text-slate-500'}`}>{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
                      <span className="block truncate text-xs font-bold text-forest-900">{user.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-400">{user.branch}</span>
                      {selected && <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-forest-500 text-white"><Check size={11} strokeWidth={3} /></span>}
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-bold text-slate-700">Password</span>
                <span className="relative block"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-100" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></span>
                <span className="mt-1.5 block text-[11px] text-slate-400">For all preview profiles: <strong className="text-slate-600">placement123</strong></span>
              </label>

              {error && <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700" role="alert">{error}</p>}

              <button type="submit" disabled={!email || submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-forest-700 disabled:opacity-60">
                {submitting ? <><LoaderCircle className="animate-spin" size={17} />Signing in…</> : <>Sign in to workspace <ArrowRight size={17} /></>}
              </button>
            </fieldset>
          </form>

          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">Seeded accounts are included for product review. Production deployment would connect institutional sign-in.</p>
        </div>
      </section>
    </main>
  );
}
