function StudentIcon() {
  return (
    <svg
      className="h-8 w-8"
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
  )
}

function RecruiterIcon() {
  return (
    <svg
      className="h-8 w-8"
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
  )
}

function Landing({ onSelect }) {
  return (
    <div className="app-backdrop min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 sm:py-20">
        <header className="animate-page-enter mb-16 text-center">
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
        </header>

        <div className="flex flex-col gap-6 sm:flex-row">
          <button
            type="button"
            onClick={() => onSelect('student-discover')}
            className="animate-page-enter group flex h-40 w-60 flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-transform duration-200 group-hover:-translate-y-0.5">
              <StudentIcon />
            </div>
            <span className="text-lg font-semibold text-gray-900">Student</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect('recruiter-dashboard')}
            className="animate-page-enter group flex h-40 w-60 flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            style={{ animationDelay: '80ms' }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-500 ring-1 ring-teal-400/30 transition-transform duration-200 group-hover:-translate-y-0.5">
              <RecruiterIcon />
            </div>
            <span className="text-lg font-semibold text-gray-900">Recruiter</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Landing
