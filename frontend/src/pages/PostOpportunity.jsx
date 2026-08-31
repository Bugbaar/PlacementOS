import { useState } from 'react'
import { createOpportunity } from '../services/opportunityService'
import {
  BRANCH_OPTIONS,
  GRADUATION_YEAR_OPTIONS,
  OPPORTUNITY_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../utils/opportunityOptions'

function Field({ label, required = false, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const inputErrorClass =
  'w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'

function TagInput({ tags, onAdd, onRemove, placeholder, error }) {
  const [value, setValue] = useState('')

  const commit = () => {
    const next = value.trim()
    if (next && !tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      onAdd(next)
      setValue('')
    }
  }

  return (
    <div>
      <div
        className={`flex min-h-11 flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm focus-within:ring-2 ${
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/30'
            : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500/30'
        }`}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${tag}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition hover:bg-blue-100 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              commit()
            } else if (event.key === 'Backspace' && value === '' && tags.length > 0) {
              onRemove(tags.length - 1)
            }
          }}
          onBlur={commit}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-40 flex-1 border-0 bg-transparent py-0.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">Press Enter or comma to add.</p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function CheckboxGroup({ options, selected, onToggle, error }) {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option)
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                checked
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="truncate">{option}</span>
            </label>
          )
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function initState() {
  return {
    company: '',
    role: '',
    domain: '',
    description: '',
    opportunityType: '',
    locations: [],
    workMode: '',
    requiredSkills: [],
    deadline: '',
    minimumCgpa: '',
    allowedBranches: [],
    graduationYears: [],
    maximumActiveBacklogs: '',
  }
}

function validate(state) {
  const errors = {}

  if (!state.company.trim()) errors.company = 'Company name is required.'

  if (!state.role.trim()) errors.role = 'Job role is required.'

  if (!state.domain.trim()) errors.domain = 'Domain is required.'

  if (!state.description.trim()) {
    errors.description = 'Opportunity description is required.'
  } else if (state.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.'
  }

  if (!state.opportunityType) errors.opportunityType = 'Select an opportunity type.'

  if (state.locations.length === 0) errors.locations = 'Add at least one location.'

  if (!state.workMode) errors.workMode = 'Select a work mode.'

  if (state.requiredSkills.length === 0) {
    errors.requiredSkills = 'Add at least one required skill.'
  }

  if (!state.deadline) {
    errors.deadline = 'Application deadline is required.'
  } else {
    const deadline = new Date(`${state.deadline}T23:59:59`)
    if (Number.isNaN(deadline.getTime())) {
      errors.deadline = 'Enter a valid date.'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      deadline.setHours(0, 0, 0, 0)
      if (deadline < today) {
        errors.deadline = 'Deadline must be a future date.'
      }
    }
  }

  if (state.minimumCgpa === '') {
    errors.minimumCgpa = 'Minimum CGPA is required.'
  } else {
    const value = Number(state.minimumCgpa)
    if (Number.isNaN(value) || value < 0 || value > 10) {
      errors.minimumCgpa = 'CGPA must be a number between 0 and 10.'
    }
  }

  if (state.allowedBranches.length === 0) {
    errors.allowedBranches = 'Select at least one allowed branch.'
  }

  if (state.graduationYears.length === 0) {
    errors.graduationYears = 'Select at least one graduation year.'
  }

  if (state.maximumActiveBacklogs === '') {
    errors.maximumActiveBacklogs = 'Maximum active backlogs is required.'
  } else {
    const value = Number(state.maximumActiveBacklogs)
    if (!Number.isInteger(value) || value < 0) {
      errors.maximumActiveBacklogs = 'Must be a non-negative whole number.'
    }
  }

  return errors
}

function SectionCard({ step, title, description, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function SuccessView({ onPostAnother, onViewOpportunities, suggestedDeadline }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-7 w-7 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-bold text-gray-900">
        Opportunity posted successfully
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        Relevant eligible students are being notified.
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Deadline: {suggestedDeadline}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3 text-xs font-medium text-gray-600">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">🏢</span> Recruiter posts
        </span>
        <span aria-hidden="true">→</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">🧠</span> Matching engine
        </span>
        <span aria-hidden="true">→</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">🔔</span> Students notified
        </span>
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onViewOpportunities}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View My Opportunities
        </button>
        <button
          type="button"
          onClick={onPostAnother}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Post another opportunity
        </button>
      </div>
    </div>
  )
}

function PostOpportunity({ onNavigate }) {
  const [form, setForm] = useState(initState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [posted, setPosted] = useState(null)

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const addTag = (key) => (value) => {
    setForm((current) => {
      if (current[key].some((item) => item.toLowerCase() === value.toLowerCase())) {
        return current
      }
      return { ...current, [key]: [...current[key], value] }
    })
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const removeTag = (key) => (index) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const toggleOption = (key) => (option) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(option)
        ? current[key].filter((item) => item !== option)
        : [...current[key], option],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(null)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      domain: form.domain.trim(),
      description: form.description.trim(),
      opportunityType: form.opportunityType,
      locations: form.locations.map((location) => location.trim()),
      workMode: form.workMode,
      requiredSkills: form.requiredSkills.map((skill) => skill.trim()),
      deadline: form.deadline,
      minimumCgpa: Number(form.minimumCgpa),
      allowedBranches: [...form.allowedBranches],
      graduationYears: form.graduationYears.map((year) => Number(year)),
      maximumActiveBacklogs: Number(form.maximumActiveBacklogs),
    }

    try {
      const result = await createOpportunity(payload)
      setPosted(result.data)
      onPosted?.()
    } catch (requestError) {
      setSubmitError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const defaultDeadline = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().slice(0, 10)
  }

  if (posted) {
    return (
      <main className="min-h-screen py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SuccessView
            onPostAnother={() => {
              setForm(initState())
              setErrors({})
              setPosted(null)
            }}
            onViewOpportunities={() => onNavigate && onNavigate('recruiter-dashboard')}
            suggestedDeadline={form.deadline ? new Date(`${form.deadline}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Post Opportunity
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Create an opportunity and PlacementOS will match it to relevant,
            eligible students automatically.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <SectionCard
              step={1}
              title="Basic Information"
              description="Tell students what the opportunity is about."
            >
              <Field label="Company Name" required error={errors.company}>
                <input
                  type="text"
                  value={form.company}
                  onChange={(event) => setField('company', event.target.value)}
                  placeholder="e.g. CloudSphere"
                  className={errors.company ? inputErrorClass : inputClass}
                />
              </Field>

              <Field label="Job Role" required error={errors.role}>
                <input
                  type="text"
                  value={form.role}
                  onChange={(event) => setField('role', event.target.value)}
                  placeholder="e.g. Frontend Developer Intern"
                  className={errors.role ? inputErrorClass : inputClass}
                />
              </Field>

              <Field label="Domain" required error={errors.domain}>
                <input
                  type="text"
                  value={form.domain}
                  onChange={(event) => setField('domain', event.target.value)}
                  placeholder="e.g. Web Development"
                  className={errors.domain ? inputErrorClass : inputClass}
                />
              </Field>
            </SectionCard>

            <SectionCard
              step={2}
              title="Opportunity Details"
              description="Define the role, location, and skills."
            >
              <Field label="Opportunity Type" required error={errors.opportunityType}>
                <div className="grid grid-cols-2 gap-2">
                  {OPPORTUNITY_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        form.opportunityType === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="opportunityType"
                        value={option}
                        checked={form.opportunityType === option}
                        onChange={() => setField('opportunityType', option)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Work Mode" required error={errors.workMode}>
                <div className="grid grid-cols-3 gap-2">
                  {WORK_MODE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        form.workMode === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="workMode"
                        value={option}
                        checked={form.workMode === option}
                        onChange={() => setField('workMode', option)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </Field>

              <div className="md:col-span-2">
                <Field label="Locations" required error={errors.locations}>
                  <TagInput
                    tags={form.locations}
                    onAdd={addTag('locations')}
                    onRemove={removeTag('locations')}
                    placeholder="e.g. Bengaluru, Remote"
                    error={errors.locations}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Required Skills" required error={errors.requiredSkills}>
                  <TagInput
                    tags={form.requiredSkills}
                    onAdd={addTag('requiredSkills')}
                    onRemove={removeTag('requiredSkills')}
                    placeholder="e.g. React, JavaScript"
                    error={errors.requiredSkills}
                  />
                </Field>
              </div>

              <Field label="Application Deadline" required error={errors.deadline}>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => setField('deadline', event.target.value)}
                  min={defaultDeadline()}
                  className={errors.deadline ? inputErrorClass : inputClass}
                />
              </Field>
            </SectionCard>

            <SectionCard
              step={3}
              title="Eligibility Criteria"
              description="Set the requirements students must meet to apply."
            >
              <Field label="Minimum CGPA" required error={errors.minimumCgpa}>
                <input
                  type="number"
                  value={form.minimumCgpa}
                  onChange={(event) => setField('minimumCgpa', event.target.value)}
                  placeholder="e.g. 7.0"
                  min="0"
                  max="10"
                  step="0.1"
                  className={errors.minimumCgpa ? inputErrorClass : inputClass}
                />
              </Field>

              <Field
                label="Maximum Active Backlogs"
                required
                error={errors.maximumActiveBacklogs}
              >
                <input
                  type="number"
                  value={form.maximumActiveBacklogs}
                  onChange={(event) =>
                    setField('maximumActiveBacklogs', event.target.value)
                  }
                  placeholder="e.g. 0"
                  min="0"
                  step="1"
                  className={errors.maximumActiveBacklogs ? inputErrorClass : inputClass}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Allowed Branches" required error={errors.allowedBranches}>
                  <CheckboxGroup
                    options={BRANCH_OPTIONS}
                    selected={form.allowedBranches}
                    onToggle={toggleOption('allowedBranches')}
                    error={errors.allowedBranches}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Graduation Years" required error={errors.graduationYears}>
                  <CheckboxGroup
                    options={GRADUATION_YEAR_OPTIONS}
                    selected={form.graduationYears.map((year) => String(year))}
                    onToggle={(option) => {
                      const normalized = Number(option)
                      setForm((current) => ({
                        ...current,
                        graduationYears: current.graduationYears.includes(normalized)
                          ? current.graduationYears.filter((year) => year !== normalized)
                          : [...current.graduationYears, normalized],
                      }))
                    }}
                    error={errors.graduationYears}
                  />
                </Field>
              </div>
            </SectionCard>

            {submitError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Could not post the opportunity: {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setForm(initState())}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {submitting ? 'Posting…' : 'Post Opportunity'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default PostOpportunity