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

/* Flat illustration background: students and recruiters connecting, outlined
   with graduation caps and briefcases as motifs, in a clean blue/teal palette. */
function IllustrationLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Graduation cap motif — top left */}
      <svg
        className="absolute left-[6%] top-[16%] h-24 w-24 text-brand-500/30 sm:h-32 sm:w-32"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 1 9l11 6 11-6L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.97v-2.85l6 3.27 6-3.27v2.85 2.5L12 20l-6-3.4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 9v4.5" />
      </svg>

      {/* Briefcase motif — top right */}
      <svg
        className="absolute right-[8%] top-[20%] h-20 w-20 text-teal-500/35 sm:h-28 sm:w-28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path strokeLinecap="round" d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>

      {/* Connection motif — right, linking dots */}
      <svg
        className="absolute right-[16%] bottom-[18%] h-20 w-20 text-brand-400/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="20" cy="16" r="1.6" fill="currentColor" stroke="none" />
        <path strokeLinecap="round" d="M12 5.6 5 11.5m7-5.6 7 8.7" />
      </svg>

      {/* Graduation cap motif — bottom left */}
      <svg
        className="absolute bottom-[14%] left-[12%] h-20 w-20 text-teal-500/30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 1 9l11 6 11-6L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12v4c0 1.5 3 3 7 3s7-1.5 7-3v-4" />
      </svg>

      {/* Small decorative shapes */}
      <div className="absolute left-[18%] top-[32%] h-3 w-3 rounded-full bg-teal-400/40" />
      <div className="absolute right-[28%] top-[12%] h-2.5 w-2.5 rounded-full bg-brand-400/40" />
      <div className="absolute bottom-[30%] right-[10%] h-3 w-3 rounded-full bg-brand-400/30" />
      <div className="absolute bottom-[10%] right-[38%] h-2 w-2 rounded-full bg-teal-400/40" />
      <div className="absolute left-[40%] top-[9%] h-2 w-2 rounded-full bg-teal-400/40" />
      <div className="absolute left-[6%] bottom-[38%] h-2.5 w-2.5 rounded-full bg-brand-400/30" />
    </div>
  )
}

function Landing({ onSelect }) {
  return (
    <div className="landing-backdrop relative min-h-screen">
      <IllustrationLayer />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-12 sm:py-20">
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
            className="animate-page-enter group flex h-40 w-60 flex-col items-center justify-center gap-4 rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-transform duration-200 group-hover:-translate-y-0.5">
              <StudentIcon />
            </div>
            <span className="text-lg font-semibold text-gray-900">Student</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect('recruiter-dashboard')}
            className="animate-page-enter group flex h-40 w-60 flex-col items-center justify-center gap-4 rounded-2xl border border-white bg-white/90 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
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
