import { useEffect, useState, type FormEvent } from 'react';
import { BookOpenCheck, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import type { Student } from '../types';

interface ProfileEditorProps {
  student: Student;
  eligibleCount: number;
  totalDrives: number;
  saving: boolean;
  onSave: (changes: Partial<Student>) => void;
}

export function ProfileEditor({ student, eligibleCount, totalDrives, saving, onSave }: ProfileEditorProps) {
  const [form, setForm] = useState({
    name: student.name,
    program: student.program,
    branch: student.branch,
    graduationYear: String(student.graduationYear),
    cgpa: String(student.cgpa),
    activeBacklogs: String(student.activeBacklogs),
    skills: student.skills.join(', '),
  });

  useEffect(() => {
    setForm({
      name: student.name,
      program: student.program,
      branch: student.branch,
      graduationYear: String(student.graduationYear),
      cgpa: String(student.cgpa),
      activeBacklogs: String(student.activeBacklogs),
      skills: student.skills.join(', '),
    });
  }, [student]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({
      name: form.name.trim(),
      program: form.program.trim(),
      branch: form.branch.trim(),
      graduationYear: Number(form.graduationYear),
      cgpa: Number(form.cgpa),
      activeBacklogs: Number(form.activeBacklogs),
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7" onSubmit={submit}>
        <div className="mb-7 flex items-start gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-700"><GraduationCap size={21} /></span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-forest-900">Academic & skill profile</h2>
            <p className="mt-1 text-sm text-slate-500">PlacementOS checks these details against every drive.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name"><input required minLength={2} value={form.name} onChange={(event) => update('name', event.target.value)} /></Field>
          <Field label="Programme"><input required value={form.program} onChange={(event) => update('program', event.target.value)} placeholder="e.g. B.Tech" /></Field>
          <Field label="Branch / discipline"><input required value={form.branch} onChange={(event) => update('branch', event.target.value)} placeholder="e.g. Computer Science" /></Field>
          <Field label="Graduation year"><input required type="number" min="2024" max="2035" value={form.graduationYear} onChange={(event) => update('graduationYear', event.target.value)} /></Field>
          <Field label="Current CGPA" hint="On a 10-point scale"><input required type="number" min="0" max="10" step="0.1" value={form.cgpa} onChange={(event) => update('cgpa', event.target.value)} /></Field>
          <Field label="Active backlogs"><input required type="number" min="0" max="30" value={form.activeBacklogs} onChange={(event) => update('activeBacklogs', event.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Skills" hint="Separate skills with commas">
              <textarea rows={3} required value={form.skills} onChange={(event) => update('skills', event.target.value)} placeholder="React, Python, SQL" />
            </Field>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="inline-flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} />Only eligibility-related information is used.</p>
          <button className="rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-700 disabled:opacity-60" disabled={saving}>
            {saving ? 'Recalculating…' : 'Save and recalculate'}
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-3xl bg-forest-900 p-6 text-white shadow-soft">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d7f46d] text-forest-900"><Sparkles size={19} /></span>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Live eligibility</p>
          <p className="mt-2 font-display text-5xl font-extrabold">{eligibleCount}<span className="text-xl text-white/35">/{totalDrives}</span></p>
          <p className="mt-2 text-sm leading-6 text-white/65">active drives currently match your academic profile.</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#d7f46d] transition-all" style={{ width: `${totalDrives ? (eligibleCount / totalDrives) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-forest-900"><BookOpenCheck size={17} className="text-forest-500" />How matching works</h3>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-slate-500">
            {['CGPA meets the company minimum', 'Branch is included by the recruiter', 'Graduation year matches the drive', 'Backlogs stay within the allowed limit'].map((item) => (
              <li key={item} className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />{item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactElement<{ className?: string }> }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
        {label}{hint && <span className="font-medium text-slate-400">{hint}</span>}
      </span>
      <span className="[&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-200 [&>input]:bg-slate-50/60 [&>input]:px-3.5 [&>input]:py-3 [&>input]:text-sm [&>input]:outline-none [&>input]:transition [&>input]:focus:border-forest-500 [&>input]:focus:bg-white [&>input]:focus:ring-2 [&>input]:focus:ring-forest-100 [&>textarea]:w-full [&>textarea]:resize-none [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-200 [&>textarea]:bg-slate-50/60 [&>textarea]:px-3.5 [&>textarea]:py-3 [&>textarea]:text-sm [&>textarea]:outline-none [&>textarea]:transition [&>textarea]:focus:border-forest-500 [&>textarea]:focus:bg-white [&>textarea]:focus:ring-2 [&>textarea]:focus:ring-forest-100">
        {children}
      </span>
    </label>
  );
}

