import { FormEvent, useState } from 'react';
import { createOpportunity, type NewOpportunityInput } from '../../api/recruiter';

interface Props {
  onCreated: () => void;
}

const EMPTY = {
  title: '',
  company: '',
  description: '',
  location: '',
  employmentType: 'Full-time',
  salaryRange: '',
  applicationDeadline: '',
};

export default function RecruiterJobForm({ onCreated }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.company || !form.description || !form.applicationDeadline) {
      setError('Title, company, description, and deadline are required.');
      return;
    }

    const payload: NewOpportunityInput = {
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      location: form.location.trim() || 'Not specified',
      employmentType: form.employmentType,
      salaryRange: form.salaryRange.trim() || undefined,
      // date input → ISO midnight UTC-safe for Zod/Date parse
      applicationDeadline: new Date(`${form.applicationDeadline}T23:59:59.000Z`).toISOString(),
    };

    setSubmitting(true);
    try {
      await createOpportunity(payload);
      setForm(EMPTY);
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-amber-200/60 bg-white p-6 space-y-4 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Post a new role</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Students will see this on the opportunities board once it is active.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          placeholder="Job title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
        />
        <input
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          placeholder="Company"
          value={form.company}
          onChange={(e) => update('company', e.target.value)}
        />
        <input
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          placeholder="Location"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
        />
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          value={form.employmentType}
          onChange={(e) => update('employmentType', e.target.value)}
        >
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
        <input
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          placeholder="CTC / stipend"
          value={form.salaryRange}
          onChange={(e) => update('salaryRange', e.target.value)}
        />
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          value={form.applicationDeadline}
          onChange={(e) => update('applicationDeadline', e.target.value)}
        />
      </div>

      <textarea
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        placeholder="Role description"
        rows={3}
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition-colors"
      >
        {submitting ? 'Posting…' : 'Post role'}
      </button>
    </form>
  );
}
