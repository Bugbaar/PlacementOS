const selectBaseClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function OpportunitySearch({ value, onChange }) {
  return (
    <div className="relative">
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onChange('')
          }
        }}
        placeholder="Search by role, company, or skill"
        aria-label="Search opportunities"
        className="appearance-none w-full rounded-xl border border-gray-300 bg-white py-3 pr-10 pl-11 text-base text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  )
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={selectBaseClass}>
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function OpportunityFilters({
  type,
  location,
  workMode,
  locations,
  onTypeChange,
  onLocationChange,
  onWorkModeChange,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SelectField
        label="Opportunity type"
        value={type}
        options={['Internship', 'Full-time']}
        onChange={onTypeChange}
      />

      <SelectField
        label="Location"
        value={location}
        options={locations}
        onChange={onLocationChange}
      />

      <SelectField
        label="Work mode"
        value={workMode}
        options={['Remote', 'Hybrid', 'On-site']}
        onChange={onWorkModeChange}
      />
    </div>
  )
}

export function ActiveFilterChips({ query, type, location, workMode, onRemoveFilters }) {
  const chips = []

  if (query.trim() !== '') {
    chips.push({
      key: 'query',
      label: `Search: ${query.trim()}`,
      remove: () => onRemoveFilters({ query: '' }),
    })
  }
  if (type !== 'All') {
    chips.push({
      key: 'type',
      label: `Type: ${type}`,
      remove: () => onRemoveFilters({ type: 'All' }),
    })
  }
  if (location !== 'All') {
    chips.push({
      key: 'location',
      label: `Location: ${location}`,
      remove: () => onRemoveFilters({ location: 'All' }),
    })
  }
  if (workMode !== 'All') {
    chips.push({
      key: 'workMode',
      label: `Work mode: ${workMode}`,
      remove: () => onRemoveFilters({ workMode: 'All' }),
    })
  }

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Active filters</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.remove}
            aria-label={`Remove ${chip.label}`}
            className="-mr-1 flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition hover:bg-blue-100 hover:text-blue-700"
          >
            <ClearIcon />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() =>
          onRemoveFilters({ query: '', type: 'All', location: 'All', workMode: 'All' })
        }
        className="ml-1 text-xs font-medium text-blue-600 transition hover:text-blue-700"
      >
        Clear all
      </button>
    </div>
  )
}