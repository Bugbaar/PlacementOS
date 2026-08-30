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

function LearningTag({ opportunity }) {
  if (opportunity.type === 'Internship') {
    return <Badge tone="blue">Internship</Badge>
  }
  return <Badge tone="violet">Full-time</Badge>
}

function EligibilityBadge({ eligibility }) {
  if (eligibility.status === 'eligible') {
    return <Badge tone="green">Eligible</Badge>
  }
  if (eligibility.status === 'partial') {
    return <Badge tone="amber">Partially matches</Badge>
  }
  return null
}

function OpportunityCard({ opportunity, eligibility }) {
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
          <LearningTag opportunity={opportunity} />
          <EligibilityBadge eligibility={eligibility} />
        </div>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {opportunity.role}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">
        {opportunity.summary}
      </p>

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
          {opportunity.location}
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
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="text-sm">
          <span className="text-gray-500">Apply by </span>
          <span className="font-medium text-gray-900">{formatDate(opportunity.deadline)}</span>
        </div>
        <DeadlineText deadline={opportunity.deadline} />
      </div>
    </article>
  )
}

export default OpportunityCard