import { useState } from 'react'
import OpportunityDiscovery from './pages/OpportunityDiscovery'
import PostOpportunity from './pages/PostOpportunity'

const navItems = [
  { key: 'discover', label: 'Opportunity Discovery', shortLabel: 'Discover', component: OpportunityDiscovery },
  { key: 'post', label: 'Post Opportunity', shortLabel: 'Post', component: PostOpportunity },
]

function App() {
  const [active, setActive] = useState('discover')

  const ActivePage = navItems.find((item) => item.key === active).component

  return (
    <div>
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setActive('discover')}
            className="flex shrink-0 items-center gap-2"
          >
            <svg
              className="h-7 w-7 text-blue-600"
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

          <div className="ml-auto flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
                  active === item.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      <ActivePage />
    </div>
  )
}

export default App