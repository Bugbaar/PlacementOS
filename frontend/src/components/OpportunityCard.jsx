import { useMemo } from 'react'
import Badge from './Badge'
import { getDaysUntil } from '../utils/opportunityUtils'

function MetaItem({ icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600">
      {icon}
      {children}
    </span>
  )
}

function formatDate(deadline) {
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatScore(score) {
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function DeadlineText({ deadline }) {
  const daysLeft = getDaysUntil(deadline)

  if (daysLeft < 0) {
    return <span className="text-gray-500">Closed</span>
  }
  if (daysLeft === 0) {
    return <span className="font-medium text-red-600">Closes today</span>
  }
  return <span className="text-gray-500">{daysLeft} days left</span>
}

function CheckIcon({ passed }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${passed ? 'text-emerald-600' : 'text-rose-500'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {passed ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      )}
    </svg>
  )
}

function MatchBreakdown({ match, opportunity }) {
  const { matchingDetails } = match
  const skills = matchingDetails?.skills ?? {}
  const matchedCount = skills.matched?.length ?? 0
  const requiredCount = opportunity.requiredSkills?.length ?? 0

  const dimensions = [
    { label: 'Role / domain preference', matched: matchingDetails?.roleDomain?.matched },
    { label: 'Preferred location', matched: matchingDetails?.location?.matched },
    { label: 'Opportunity type', matched: matchingDetails?.opportunityType?.matched },
  ]

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-900">Why this match</p>
      <p className="mt-1 text-xs text-gray-600">
        {matchedCount} of {requiredCount} required skills matched
        {skills.percentage !== undefined ? ` (${skills.percentage}% skill coverage)` : ''}.
      </p>
      <ul className="mt-3 space-y-2">
        {dimensions.map((dimension) => (
          <li key={dimension.label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700">{dimension.label}</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              {dimension.matched ? 'Matched' : 'Not matched'}
              <CheckIcon passed={dimension.matched} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EligibilityDetails({ match }) {
  const details = match.eligibilityDetails ?? {}

  const checks = [
    { key: 'cgpa', label: 'CGPA' },
    { key: 'branch', label: 'Branch' },
    { key: 'graduationYear', label: 'Graduation year' },
    { key: 'backlogs', label: 'Active backlogs' },
  ]

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-gray-900">Eligibility</p>
      <ul className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {checks.map(({ key, label }) => {
          const check = details[key]
          if (!check) {
            return null
          }
          return (
            <li
              key={key}
              title={check.reason}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <CheckIcon passed={check.passed} />
              <span>{label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function OpportunityCard({ opportunity, match }) {
  const matchedSkills = useMemo(
    () =>
      new Set(
        (match.matchingDetails?.skills?.matched ?? []).map((skill) => skill.toLowerCase()),
      ),
    [match],
  )

  const isMatchedSkill = (skill) => matchedSkills.has(skill.toLowerCase())

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
            {opportunity.company.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{opportunity.company}</p>
            <p className="text-xs text-gray-500">PlacementOS verified</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone={opportunity.opportunityType === 'Internship' ? 'blue' : 'violet'}>
            {opportunity.opportunityType}
          </Badge>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {formatScore(match.matchScore)}
              <span className="text-sm font-semibold text-gray-400">%</span>
            </p>
            <span className="text-xs text-gray-500">Match score</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {match.relevant ? (
          <Badge tone="blue">Relevant</Badge>
        ) : (
          <Badge tone="neutral">Low relevance</Badge>
        )}
        {match.eligible ? (
          <Badge tone="green">Eligible</Badge>
        ) : (
          <Badge tone="red">Not eligible</Badge>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">{opportunity.role}</h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{opportunity.description}</p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <MetaItem
          icon={
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <circle cx="12" cy="11" r="3" />
            </svg>
          }
        >
          {opportunity.locations?.join(' · ')}
        </MetaItem>
        <MetaItem
          icon={
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18" />
            </svg>
          }
        >
          {opportunity.workMode}
        </MetaItem>
        <MetaItem
          icon={
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        >
          {opportunity.domain}
        </MetaItem>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.requiredSkills?.map((skill) => (
          <span
            key={skill}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              isMatchedSkill(skill)
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <EligibilityDetails match={match} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="text-sm">
          <span className="text-gray-500">Apply by </span>
          <span className="font-medium text-gray-900">{formatDate(opportunity.deadline)}</span>
        </div>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply
        </button>
      </div>
    </article>
  )
}

export default OpportunityCard