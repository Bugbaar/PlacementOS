import { useState } from 'react'
import Landing from './pages/Landing'
import OpportunityDiscovery from './pages/OpportunityDiscovery'
import BrowseOpportunities from './pages/BrowseOpportunities'
import StudentProfile from './pages/StudentProfile'
import RecruiterDashboard from './pages/RecruiterDashboard'
import PostOpportunity from './pages/PostOpportunity'

function Logo({ onHome }) {
  return (
    <button type="button" onClick={onHome} className="flex shrink-0 items-center gap-2">
      <svg
        className="h-7 w-7 text-brand-600"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 3 1 9l11 6 11-6L12 3z" />
        <path d="M6 13.97v-2.85l6 3.27 6-3.27v2.85L12 18.84l-6-3.87z" />
      </svg>
      <span className="hidden text-base font-bold text-gray-900 sm:inline">
        PlacementOS
      </span>
    </button>
  )
}

function ExperienceBadge({ label, tone }) {
  return (
    <span
      className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold md:inline-flex ${
        tone === 'recruiter'
          ? 'bg-teal-400/15 text-teal-500'
          : 'bg-brand-50 text-brand-600'
      }`}
    >
      {label}
    </span>
  )
}

function AppNav({ items, active, onNavigate, experience, onSwitch }) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <Logo onHome={onSwitch} />
        <ExperienceBadge label={experience} tone={experience === 'Recruiter' ? 'recruiter' : 'student'} />

        <div className="ml-auto flex items-center gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`rounded-lg px-2.5 py-2 text-sm font-medium transition hover:bg-gray-50 ${
                active === item.key ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="sm:hidden">{item.shortLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onSwitch}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7h12m0 0-4-4m4 4-4 4m0 6H4m0 0 4 4m-4-4 4-4"
              />
            </svg>
            <span className="hidden sm:inline">Switch Experience</span>
            <span className="sm:hidden">Switch</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

const STUDENT_ITEMS = [
  { key: 'student-discover', label: 'Discover', shortLabel: 'Discover' },
  { key: 'student-browse', label: 'Browse Opportunities', shortLabel: 'Browse' },
  { key: 'student-profile', label: 'My Profile', shortLabel: 'Profile' },
]

const RECRUITER_ITEMS = [
  { key: 'recruiter-dashboard', label: 'My Opportunities', shortLabel: 'Mine' },
  { key: 'recruiter-post', label: 'Post Opportunity', shortLabel: 'Post' },
]

function App() {
  const [route, setRoute] = useState('landing')

  const navigate = (name) => setRoute(name)
  const switchExperience = () => setRoute('landing')

  const studentNav = (active) => (
    <AppNav
      items={STUDENT_ITEMS}
      active={active}
      onNavigate={navigate}
      experience="Student"
      onSwitch={switchExperience}
    />
  )

  const recruiterNav = (active) => (
    <AppNav
      items={RECRUITER_ITEMS}
      active={active}
      onNavigate={navigate}
      experience="Recruiter"
      onSwitch={switchExperience}
    />
  )

  const renderRoute = () => {
    switch (route) {
      case 'student-discover':
        return (
          <div className="app-backdrop">
            {studentNav('student-discover')}
            <OpportunityDiscovery onNavigate={navigate} />
          </div>
        )
      case 'student-browse':
        return (
          <div className="app-backdrop">
            {studentNav('student-browse')}
            <BrowseOpportunities onNavigate={navigate} />
          </div>
        )
      case 'student-profile':
        return (
          <div className="app-backdrop">
            {studentNav('student-profile')}
            <StudentProfile onNavigate={navigate} />
          </div>
        )
      case 'recruiter-dashboard':
        return (
          <div className="app-backdrop">
            {recruiterNav('recruiter-dashboard')}
            <RecruiterDashboard onNavigate={navigate} />
          </div>
        )
      case 'recruiter-post':
        return (
          <div className="app-backdrop">
            {recruiterNav('recruiter-post')}
            <PostOpportunity onNavigate={navigate} />
          </div>
        )
      case 'landing':
      default:
        return <Landing onSelect={navigate} />
    }
  }

  return renderRoute()
}

export default App
