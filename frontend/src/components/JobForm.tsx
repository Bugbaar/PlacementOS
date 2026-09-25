import { useState, type FormEvent } from 'react';
import type { EmploymentType, NewJobInput } from '../types';
import { createJob } from '../api/recruiterApi';

interface JobFormProps {
  recruiterId: string;
  onCreated: () => void;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  companyName: '',
  location: '',
  employmentType: 'full-time' as EmploymentType,
  ctc: '',
  applicationDeadline: '',
};

export default function JobForm({ recruiterId, onCreated }: JobFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.companyName || !form.applicationDeadline) {
      setError('Title, description, company name, and deadline are required.');
      return;
    }

    const payload: NewJobInput = { recruiterId, ...form };

    setSubmitting(true);
    try {
      await createJob(payload);
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 mb-8">
      <h2 className="text-lg font-semibold text-gray-800">Post a new job</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Job title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Company name"
          value={form.companyName}
          onChange={(e) => update('companyName', e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Location"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={form.employmentType}
          onChange={(e) => update('employmentType', e.target.value)}
        >
          <option value="full-time">Full-time</option>
          <option value="internship">Internship</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="CTC / Stipend"
          value={form.ctc}
          onChange={(e) => update('ctc', e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2 text-sm"
          value={form.applicationDeadline}
          onChange={(e) => update('applicationDeadline', e.target.value)}
        />
      </div>

      <textarea
        className="border rounded px-3 py-2 text-sm w-full"
        placeholder="Job description"
        rows={3}
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
      >
        {submitting ? 'Posting…' : 'Post job'}
      </button>
    </form>
  );
}
