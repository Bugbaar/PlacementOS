import { useCallback, useEffect, useMemo, useState } from 'react'
import OpportunityCard from '../components/OpportunityCard'
import {
  ActiveFilterChips,
  OpportunityFilters,
  OpportunitySearch,
} from '../components/OpportunityFilters'
import { filterOpportunities, getUniqueLocations } from '../utils/opportunityUtils'
import { fetchStudentMatches } from '../services/matchService'
import {
  applyToOpportunity,
  fetchStudentApplications,
} from '../services/applicationService'
import { CURRENT_STUDENT_ID } from '../config'

function LoadingGrid() {
  return (
    <div className="grid gap-6">
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

function OpportunityDiscovery({ onNavigate }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('All')
  const [workMode, setWorkMode] = useState('All')
  const [searchFocused, setSearchFocused] = useState(false)
  const [appliedIds, setAppliedIds] = useState(() => new Set())
  const [submittingId, setSubmittingId] = useState(null)
  const [applyError, setApplyError] = useState(null)

  const loadMatches = useCallback(
    () => fetchStudentMatches(CURRENT_STUDENT_ID),
    [],
  )

  useEffect(() => {
    let cancelled = false

    Promise.all([
      loadMatches(),
      fetchStudentApplications(CURRENT_STUDENT_ID),
    ])
      .then(([matchesBody, applicationsBody]) => {
        if (!cancelled) {
          setMatches(matchesBody.data)
          setAppliedIds(
            new Set(
              applicationsBody.data.map((application) => application.opportunityId),
            ),
          )
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

  const searchExpanded = searchFocused || hasActiveFilters

  const clearFilters = () => {
    setQuery('')
    setType('All')
    setLocation('All')
    setWorkMode('All')
  }

  const removeFilters = (changes) => {
    if (changes.query !== undefined) {
      setQuery(changes.query)
    }
    if (changes.type !== undefined) {
      setType(changes.type)
    }
    if (changes.location !== undefined) {
      setLocation(changes.location)
    }
    if (changes.workMode !== undefined) {
      setWorkMode(changes.workMode)
    }
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
    Promise.all([
      loadMatches(),
      fetchStudentApplications(CURRENT_STUDENT_ID),
    ])
      .then(([matchesBody, applicationsBody]) => {
        setMatches(matchesBody.data)
        setAppliedIds(
          new Set(
            applicationsBody.data.map((application) => application.opportunityId),
          ),
        )
        setLoading(false)
      })
      .catch((requestError) => {
        setError(requestError.message)
        setLoading(false)
      })
  }

  const handleApply = async (opportunity) => {
    setSubmittingId(opportunity.id)
    setApplyError(null)
    try {
      await applyToOpportunity(opportunity.id, CURRENT_STUDENT_ID)
      setAppliedIds((current) => new Set(current).add(opportunity.id))
    } catch (requestError) {
      setApplyError(requestError.message)
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Opportunity Discovery
            </h1>
          </div>
        </header>

        <section
          role="search"
          className="mb-6"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        >
          <div className="max-w-xl">
            <OpportunitySearch value={query} onChange={setQuery} />
          </div>

          <div
            id="opportunity-filters"
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              searchExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden" inert={!searchExpanded} aria-hidden={!searchExpanded}>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <OpportunityFilters
                  type={type}
                  location={location}
                  workMode={workMode}
                  locations={locations}
                  onTypeChange={setType}
                  onLocationChange={setLocation}
                  onWorkModeChange={setWorkMode}
                />
                <ActiveFilterChips
                  query={query}
                  type={type}
                  location={location}
                  workMode={workMode}
                  onRemoveFilters={removeFilters}
                />
              </div>
            </div>
          </div>
        </section>

        {!loading && !error && (
          <div className="mt-4 mb-4">
            <p className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold text-gray-900">{results.length}</span> of{' '}
              {opportunities.length} opportunities
            </p>
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
          <div className="grid gap-6">
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