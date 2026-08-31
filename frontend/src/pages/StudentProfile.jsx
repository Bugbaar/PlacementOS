import { useCallback, useEffect, useState } from 'react'
import * as studentService from '../services/studentService'
import { CURRENT_STUDENT_ID } from '../config'
import {
  BRANCH_OPTIONS,
  OPPORTUNITY_TYPE_OPTIONS,
  GRADUATION_YEAR_OPTIONS,
  ROLE_SUGGESTIONS,
  DOMAIN_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
} from '../utils/opportunityOptions'

function Field({ label, required, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

function TagEditor({ value, suggestions, onChange }) {
  const [draft, setDraft] = useState('')

  const add = (raw) => {
    const next = raw.trim()
    if (!next) return
    if (!value.some((item) => item.toLowerCase() === next.toLowerCase())) {
      onChange([...value, next])
    }
    setDraft('')
  }

  const remove = (tag) => {
    onChange(value.filter((item) => item !== tag))
  }

  const availableSuggestions = suggestions.filter(
    (suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/30">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remove ${tag}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-brand-500 transition hover:bg-brand-100 hover:text-brand-700"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              add(draft)
            } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
              remove(value[value.length - 1])
            }
          }}
          onBlur={() => add(draft)}
          placeholder={value.length === 0 ? 'Type and press Enter to add' : ''}
          className="min-w-40 flex-1 border-0 bg-transparent py-0.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      {availableSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ToggleOptions({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              checked
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(() => studentService.fetchStudentProfile(CURRENT_STUDENT_ID), [])

  useEffect(() => {
    let cancelled = false
    load()
      .then((body) => {
        if (cancelled) return
        const data = { ...body.data }
        setProfile(data)
        setForm({
          name: data.name,
          email: data.email,
          branch: data.branch,
          cgpa: String(data.cgpa),
          graduationYear: String(data.graduationYear),
          activeBacklogs: String(data.activeBacklogs),
          skills: [...data.skills],
          preferredRoles: [...data.preferredRoles],
          preferredDomains: [...data.preferredDomains],
          preferredLocations: [...data.preferredLocations],
          preferredOpportunityTypes: [...data.preferredOpportunityTypes],
        })
        setLoading(false)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [load])

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const toggleList = (key) => (option) => {
    setForm((current) => {
      const list = current[key]
      return {
        ...current,
        [key]: list.includes(option)
          ? list.filter((item) => item !== option)
          : [...list, option],
      }
    })
  }

  useEffect(() => {
    if (!saved) return undefined
    const timer = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(timer)
  }, [saved])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const body = await studentService.updateStudentProfile(CURRENT_STUDENT_ID, {
        name: form.name,
        email: form.email,
        branch: form.branch,
        cgpa: Number(form.cgpa),
        graduationYear: Number(form.graduationYear),
        activeBacklogs: Number(form.activeBacklogs),
        skills: form.skills,
        preferredRoles: form.preferredRoles,
        preferredDomains: form.preferredDomains,
        preferredLocations: form.preferredLocations,
        preferredOpportunityTypes: form.preferredOpportunityTypes,
      })
      setProfile(body.data)
      setSaved(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
        </div>
      </main>
    )
  }

  if (error && !profile) {
    return (
      <main className="min-h-screen py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-base font-medium text-gray-900">Could not load your profile</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setError(null)
                load().then((body) => {
                  const data = { ...body.data }
                  setProfile(data)
                  setForm({
                    name: data.name,
                    email: data.email,
                    branch: data.branch,
                    cgpa: String(data.cgpa),
                    graduationYear: String(data.graduationYear),
                    activeBacklogs: String(data.activeBacklogs),
                    skills: [...data.skills],
                    preferredRoles: [...data.preferredRoles],
                    preferredDomains: [...data.preferredDomains],
                    preferredLocations: [...data.preferredLocations],
                    preferredOpportunityTypes: [...data.preferredOpportunityTypes],
                  })
                  setLoading(false)
                })
              }}
              className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-10">
      <div className="animate-page-enter mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="mt-2 text-base text-gray-600">
            Your profile powers your matches. Update your skills and preferences to
            improve your recommendations.
          </p>
        </header>

        {saved && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Profile saved. Your matches now reflect your updated profile.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Basic Information"
            description="Your academic details shown across the platform."
          >
            <Field label="Name" required>
              <input
                className={inputBase}
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
              />
            </Field>
            <Field label="Email" required>
              <input
                className={inputBase}
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
              />
            </Field>
            <Field label="Branch" required>
              <select
                className={inputBase}
                value={form.branch}
                onChange={(event) => setField('branch', event.target.value)}
              >
                {BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="CGPA" required>
                <input
                  className={inputBase}
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={form.cgpa}
                  onChange={(event) => setField('cgpa', event.target.value)}
                />
              </Field>
              <Field label="Grad Year" required>
                <select
                  className={inputBase}
                  value={form.graduationYear}
                  onChange={(event) => setField('graduationYear', event.target.value)}
                >
                  {GRADUATION_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Backlogs" required>
                <input
                  className={inputBase}
                  type="number"
                  min="0"
                  value={form.activeBacklogs}
                  onChange={(event) => setField('activeBacklogs', event.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Skills" description="Skills you can offer to employers.">
              <TagEditor
                value={form.skills}
                suggestions={[
                  'JavaScript',
                  'React',
                  'HTML',
                  'CSS',
                  'Tailwind CSS',
                  'Node.js',
                  'Express.js',
                  'REST APIs',
                  'MongoDB',
                  'PostgreSQL',
                  'Git',
                  'Docker',
                  'Redis',
                  'TypeScript',
                  'GraphQL',
                  'Python',
                ]}
                onChange={(skills) => setField('skills', skills)}
              />
            </SectionCard>

            <SectionCard title="Preferred Opportunity Types">
              <ToggleOptions
                options={OPPORTUNITY_TYPE_OPTIONS}
                selected={form.preferredOpportunityTypes}
                onToggle={toggleList('preferredOpportunityTypes')}
              />
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard
              title="Career Preferences"
              description="The roles, domains, and locations you are most interested in."
            >
              <Field label="Preferred Roles">
                <TagEditor
                  value={form.preferredRoles}
                  suggestions={ROLE_SUGGESTIONS}
                  onChange={(roles) => setField('preferredRoles', roles)}
                />
              </Field>
              <Field label="Preferred Domains">
                <TagEditor
                  value={form.preferredDomains}
                  suggestions={DOMAIN_SUGGESTIONS}
                  onChange={(domains) => setField('preferredDomains', domains)}
                />
              </Field>
              <Field label="Preferred Locations">
                <TagEditor
                  value={form.preferredLocations}
                  suggestions={LOCATION_SUGGESTIONS}
                  onChange={(locations) => setField('preferredLocations', locations)}
                />
              </Field>
            </SectionCard>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null)
              setSaved(false)
              if (profile) {
                setForm({
                  name: profile.name,
                  email: profile.email,
                  branch: profile.branch,
                  cgpa: String(profile.cgpa),
                  graduationYear: String(profile.graduationYear),
                  activeBacklogs: String(profile.activeBacklogs),
                  skills: [...profile.skills],
                  preferredRoles: [...profile.preferredRoles],
                  preferredDomains: [...profile.preferredDomains],
                  preferredLocations: [...profile.preferredLocations],
                  preferredOpportunityTypes: [...profile.preferredOpportunityTypes],
                })
              }
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default StudentProfile
