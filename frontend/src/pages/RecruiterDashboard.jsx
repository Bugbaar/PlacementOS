import { useCallback, useEffect, useState } from 'react'
import {
  fetchOpportunities,
  fetchApplications,
  closeOpportunity,
} from '../services/opportunityService'

function formatDate(deadline) {
  if (!deadline) return '—'
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatus(opportunity) {
  if (!opportunity.deadline) return 'Active'
  const deadline = new Date(`${opportunity.deadline}T23:59:59`)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return deadline >= today ? 'Active' : 'Expired'
}

function ApplicationsDrawer({ opportunityId }) {
  const [applications, setApplications] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchApplications(opportunityId)
      .then((body) => {
        if (!cancelled) setApplications(body.data)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })
    return () => {
      cancelled = true
    }
  }, [opportunityId])

  if (error) {
    return <p className="mt-4 text-sm text-rose-600">Could not load applications: {error}</p>
  }

  if (!applications) {
    return (
      <div className="mt-4 h-20 animate-pulse rounded-lg border border-gray-100 bg-gray-50" />
    )
  }

  if (applications.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        No applications received yet. Students can apply once they match and are eligible.
      </p>
    )
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
      <ul className="divide-y divide-gray-100">
        {applications.map((application) => (
          <li key={application.id} className="flex flex-wrap items-center gap-3 bg-gray-50/60 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
              {(application.student?.name ?? '?').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {application.student?.name ?? 'Student'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {(application.student?.skills ?? []).slice(0, 4).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-xs text-gray-500">
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {application.matchScore}% match
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {application.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function OpportunityRow({ opportunity, expanded, onToggle, onClose }) {
  const analytics = opportunity.analytics ?? {}
  const closed = Boolean(opportunity.closed)
  const status = closed ? 'Closed' : getStatus(opportunity)

  return (
    <div className="card-lift rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{opportunity.role}</h3>
            <p className="text-sm text-gray-600">{opportunity.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {!closed && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                Close
              </button>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                closed
                  ? 'bg-gray-200 text-gray-600'
                  : status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-600">
          <span>{opportunity.opportunityType}</span>
          <span>·</span>
          <span>{opportunity.domain}</span>
          <span>·</span>
          <span>{opportunity.workMode}</span>
          <span>·</span>
          <span>{opportunity.locations?.join(', ')}</span>
          <span>·</span>
          <span>Apply by {formatDate(opportunity.deadline)}</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
            <p className="text-xl font-bold text-emerald-600">
              {analytics.applicationsReceived ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Applications received</p>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            {expanded ? 'Hide applications' : 'View applications'}
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pt-1 pb-5">
          <ApplicationsDrawer opportunityId={opportunity.id} />
        </div>
      )}
    </div>
  )
}

function RecruiterDashboard({ onNavigate }) {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const load = useCallback(() => fetchOpportunities(), [])

  const handleClose = useCallback(
    async (opportunityId) => {
      try {
        await closeOpportunity(opportunityId)
        setOpportunities((previous) =>
          previous.map((opportunity) =>
            opportunity.id === opportunityId
              ? { ...opportunity, closed: true }
              : opportunity,
          ),
        )
      } catch (requestError) {
        setError(requestError.message)
      }
    },
    [],
  )
  useEffect(() => {
    let cancelled = false
    load()
      .then((body) => {
        if (!cancelled) {
          setOpportunities(body.data)
          setLoading(false)
        }
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

  if (loading) {
    return (
      <main className="min-h-screen py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-xl border border-gray-200 bg-white" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-10">
      <div className="animate-page-enter mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Opportunities</h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('recruiter-post')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            Post Opportunity
          </button>
        </header>

        {error ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-base font-medium text-gray-900">Could not load opportunities</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setError(null)
                load()
                  .then((body) => {
                    setOpportunities(body.data)
                    setLoading(false)
                  })
                  .catch((requestError) => {
                    setError(requestError.message)
                    setLoading(false)
                  })
              }}
              className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-base font-medium text-gray-900">No opportunities posted yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Post your first opportunity to start reaching relevant students.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('recruiter-post')}
              className="mt-5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Post Opportunity
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <OpportunityRow
                key={opportunity.id}
                opportunity={opportunity}
                expanded={expandedId === opportunity.id}
                onToggle={() =>
                  setExpandedId((current) =>
                    current === opportunity.id ? null : opportunity.id,
                  )
                }
                onClose={() => handleClose(opportunity.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default RecruiterDashboard
