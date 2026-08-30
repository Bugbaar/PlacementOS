import { useCallback, useEffect, useMemo, useState } from 'react'
import OpportunityCard from '../components/OpportunityCard'
import OpportunityFilters from '../components/OpportunityFilters'
import NotificationBell from '../components/NotificationBell'
import { fetchStudentMatches } from '../services/matchService'
import { CURRENT_STUDENT_ID } from '../config'
import { filterOpportunities, getUniqueLocations } from '../utils/opportunityUtils'

function LoadingGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ))}
    </div>
  )
}

function EmptyState({ message, subMessage, actionLabel, onAction }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
      <p className="text-base font-medium text-gray-900">{message}</p>
      <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function OpportunityDiscovery() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('All')
  const [workMode, setWorkMode] = useState('All')

  const loadMatches = useCallback(
    () => fetchStudentMatches(CURRENT_STUDENT_ID),
    [],
  )

  useEffect(() => {
    let cancelled = false

    loadMatches()
      .then((body) => {
        if (!cancelled) {
          setMatches(body.data)
          setError(null)
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
  }, [loadMatches])

  const opportunities = useMemo(
    () => matches.map((match) => ({ ...match.opportunity, match })),
    [matches],
  )

  const locations = useMemo(() => getUniqueLocations(opportunities), [opportunities])

  const hasActiveFilters =
    query.trim() !== '' || type !== 'All' || location !== 'All' || workMode !== 'All'

  const clearFilters = () => {
    setQuery('')
    setType('All')
    setLocation('All')
    setWorkMode('All')
  }

  const results = useMemo(
    () =>
      filterOpportunities(opportunities, {
        query,
        type,
        location,
        workMode,
      }),
    [opportunities, query, type, location, workMode],
  )

  const retry = () => {
    setLoading(true)
    setError(null)
    loadMatches()
      .then((body) => {
        setMatches(body.data)
        setLoading(false)
      })
      .catch((requestError) => {
        setError(requestError.message)
        setLoading(false)
      })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Opportunity Discovery
            </h1>
            <p className="mt-2 max-w-2xl text-base text-gray-600">
              Explore internships and full-time roles that match your skills.
              Search, filter, and apply before the deadline.
            </p>
          </div>
          <NotificationBell />
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

        {!loading && !error && (
          <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold text-gray-900">{results.length}</span> of{' '}
              {opportunities.length} opportunities
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <EmptyState
            message="Could not load opportunities"
            subMessage={error}
            actionLabel="Try again"
            onAction={retry}
          />
        ) : opportunities.length === 0 ? (
          <EmptyState
            message="No opportunities found"
            subMessage="New opportunities will appear here once they are published."
            actionLabel="Refresh"
            onAction={retry}
          />
        ) : results.length === 0 ? (
          <EmptyState
            message="No opportunities found"
            subMessage="Try adjusting your search or clearing some filters."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                match={opportunity.match}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default OpportunityDiscovery