import { useCallback, useMemo, useState } from 'react'
import { useEffect } from 'react'
import OpportunityCard from '../components/OpportunityCard'
import {
  ActiveFilterChips,
  OpportunityFilters,
  OpportunitySearch,
} from '../components/OpportunityFilters'
import { fetchStudentMatches } from '../services/matchService'
import {
  applyToOpportunity,
  fetchStudentApplications,
} from '../services/applicationService'
import { CURRENT_STUDENT_ID } from '../config'
import {
  filterOpportunities,
  getUniqueLocations,
  getUniqueDomains,
} from '../utils/opportunityUtils'

function EmptyState({ message, subMessage }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
      <p className="text-base font-medium text-gray-900">{message}</p>
      <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
    </div>
  )
}

function BrowseOpportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [appliedIds, setAppliedIds] = useState(() => new Set())
  const [submittingId, setSubmittingId] = useState(null)

  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('All')
  const [workMode, setWorkMode] = useState('All')
  const [domain, setDomain] = useState('All')

  const load = useCallback(() => {
    return Promise.all([
      fetchStudentMatches(CURRENT_STUDENT_ID),
      fetchStudentApplications(CURRENT_STUDENT_ID),
    ])
  }, [])

  useEffect(() => {
    let cancelled = false

    load()
      .then(([matchesBody, applicationsBody]) => {
        if (cancelled) return
        setOpportunities(
          matchesBody.data.map((match) => ({ ...match.opportunity, match })),
        )
        setAppliedIds(
          new Set(applicationsBody.data.map((application) => application.opportunityId)),
        )
        setError(null)
        setLoading(false)
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
  }, [load])

  const locations = useMemo(() => getUniqueLocations(opportunities), [opportunities])
  const domains = useMemo(() => getUniqueDomains(opportunities), [opportunities])

  const results = useMemo(
    () =>
      filterOpportunities(opportunities, {
        query,
        type,
        location,
        workMode,
        domain,
      }),
    [opportunities, query, type, location, workMode, domain],
  )

  const hasActiveFilters =
    query.trim() !== '' ||
    type !== 'All' ||
    location !== 'All' ||
    workMode !== 'All' ||
    domain !== 'All'

  const clearFilters = () => {
    setQuery('')
    setType('All')
    setLocation('All')
    setWorkMode('All')
    setDomain('All')
  }

  const removeFilters = (changes) => {
    if (changes.query !== undefined) setQuery(changes.query)
    if (changes.type !== undefined) setType(changes.type)
    if (changes.location !== undefined) setLocation(changes.location)
    if (changes.workMode !== undefined) setWorkMode(changes.workMode)
    if (changes.domain !== undefined) setDomain(changes.domain)
  }

  const handleApply = async (opportunity) => {
    setSubmittingId(opportunity.id)
    try {
      await applyToOpportunity(opportunity.id, CURRENT_STUDENT_ID)
      setAppliedIds((current) => new Set(current).add(opportunity.id))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmittingId(null)
    }
  }

  const retry = () => {
    setLoading(true)
    setError(null)
    load()
      .then(([matchesBody, applicationsBody]) => {
        setOpportunities(
          matchesBody.data.map((match) => ({ ...match.opportunity, match })),
        )
        setAppliedIds(
          new Set(applicationsBody.data.map((application) => application.opportunityId)),
        )
        setLoading(false)
      })
      .catch((requestError) => {
        setError(requestError.message)
        setLoading(false)
      })
  }

  return (
    <main className="min-h-screen py-10">
      <div className="animate-page-enter mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Browse Opportunities
            </h1>
            <p className="mt-2 max-w-2xl text-base text-gray-600">
              Explore every posted opportunity. You can apply to opportunities you
              match and are eligible for.
            </p>
          </div>
        </header>

        <section className="mb-6">
          <div className="max-w-xl">
            <OpportunitySearch value={query} onChange={setQuery} />
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <OpportunityFilters
              type={type}
              location={location}
              workMode={workMode}
              domain={domain}
              locations={locations}
              domains={domains}
              onTypeChange={setType}
              onLocationChange={setLocation}
              onWorkModeChange={setWorkMode}
              onDomainChange={setDomain}
            />
            <ActiveFilterChips
              query={query}
              type={type}
              location={location}
              workMode={workMode}
              domain={domain}
              onRemoveFilters={removeFilters}
            />
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
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <EmptyState message="Could not load opportunities" subMessage={error} />
        ) : opportunities.length === 0 ? (
          <EmptyState
            message="No opportunities found"
            subMessage="New opportunities will appear here once they are published."
          />
        ) : results.length === 0 ? (
          <EmptyState
            message="No matching opportunities"
            subMessage="Try adjusting your search or clearing some filters."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                match={opportunity.match}
                applied={appliedIds.has(opportunity.id)}
                submitting={submittingId === opportunity.id}
                onApply={() => handleApply(opportunity)}
              />
            ))}
          </div>
        )}

        {hasActiveFilters && results.length > 0 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default BrowseOpportunities
