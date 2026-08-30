import { useMemo, useState } from 'react'
import OpportunityCard from '../components/OpportunityCard'
import OpportunityFilters from '../components/OpportunityFilters'
import { opportunities, studentSkills } from '../data/opportunities'
import {
  filterOpportunities,
  getEligibility,
  getUniqueLocations,
} from '../utils/opportunityUtils'

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
      <p className="text-base font-medium text-gray-900">No opportunities found</p>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search or clearing some filters.
      </p>
    </div>
  )
}

function OpportunityDiscovery() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('All')
  const [workMode, setWorkMode] = useState('All')

  const locations = useMemo(() => getUniqueLocations(opportunities), [])

  const results = useMemo(
    () =>
      filterOpportunities(opportunities, {
        query,
        type,
        location,
        workMode,
      }),
    [query, type, location, workMode],
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Opportunity Discovery
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600">
            Explore internships and full-time roles that match your skills.
            Search, filter, and apply before the deadline.
          </p>
        </header>

        <OpportunityFilters
          query={query}
          type={type}
          location={location}
          workMode={workMode}
          locations={locations}
          onQueryChange={setQuery}
          onTypeChange={setType}
          onLocationChange={setLocation}
          onWorkModeChange={setWorkMode}
        />

        <div className="mt-6 mb-4">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">{results.length}</span>{' '}
            of {opportunities.length} opportunities
          </p>
        </div>

        {results.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                eligibility={getEligibility(opportunity, studentSkills)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default OpportunityDiscovery