function StudentIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.25c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5-2.5-1-2.5-2.5 1-2.5 2.5-2.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-3.75c0-1.2-.9-2.25-2.05-2.55-1.9-.5-3.95-1.15-5.2-2.55C3.55 11 3.3 8.9 4.3 7.2 5.2 9.3 7.3 10 9.5 10.05M12 21v-3.75c0-1.2.9-2.25 2.05-2.55 1.9-.5 3.95-1.15 5.2-2.55C20.45 11 20.7 8.9 19.7 7.2 18.8 9.3 16.7 10 14.5 10.05"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.5 17.5c.6-1.2 1.9-2 3.4-2M18.1 15.5c1.5 0 2.8.8 3.4 2"
        />
      </svg>
    </div>
  )
}

function RecruiterIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-500 ring-1 ring-teal-400/30">
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-.5a3.5 3.5 0 0 0-3.5-3.5h-2.5"
        />
        <circle cx="13" cy="7" r="2.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 20v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1"
        />
        <circle cx="6" cy="7" r="2.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 20v-1a4 4 0 0 1 4-4h0"
        />
      </svg>
    </div>
  )
}

function FeatureItem({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600">
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span>{children}</span>
    </li>
  )
}

function RoleCard({ title, description, features, cta, onClick, icon, tone }) {
  const accent =
    tone === 'recruiter' ? 'text-teal-500' : 'text-brand-600'

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="transition-transform duration-200 group-hover:-translate-y-0.5">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <FeatureItem key={feature}>{feature}</FeatureItem>
        ))}
      </ul>
      <span
        className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${accent}`}
      >
        {cta}
        <svg
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      </span>
    </button>
  )
}

function Landing({ onSelect }) {
  return (
    <div className="app-backdrop min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <header className="animate-page-enter mb-12 text-center">
          <div className="mx-auto flex items-center justify-center gap-2.5">
            <svg
              className="h-9 w-9 text-brand-600"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 3 1 9l11 6 11-6L12 3z" />
              <path d="M6 13.97v-2.85l6 3.27 6-3.27v2.85L12 18.84l-6-3.87z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              PlacementOS
            </span>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            A career and placement platform that matches students to the right
            opportunities — and helps recruiters reach the right talent.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="animate-page-enter">
            <RoleCard
              icon={<StudentIcon />}
              title="Student"
              description="Discover opportunities that match your skills, preferences, and eligibility."
              features={[
                'Personalized opportunity matching',
                'Match scores & eligibility insights',
                'Relevant opportunity notifications',
              ]}
              cta="Explore Opportunities"
              tone="student"
              onClick={() => onSelect('student-discover')}
            />
          </div>

          <div className="animate-page-enter" style={{ animationDelay: '80ms' }}>
            <RoleCard
              icon={<RecruiterIcon />}
              title="Recruiter"
              description="Post opportunities and connect with relevant, eligible student talent."
              features={[
                'Post internships and full-time roles',
                'Define skills and eligibility criteria',
                'Reach relevant students & view reach',
              ]}
              cta="Post an Opportunity"
              tone="recruiter"
              onClick={() => onSelect('recruiter-dashboard')}
            />
          </div>
        </div>

        <p className="animate-page-enter mt-12 text-center text-sm text-gray-400">
          Matching is evaluated for every opportunity as it is created — relevant,
          eligible students are notified automatically.
        </p>
      </div>
    </div>
  )
}

export default Landing
