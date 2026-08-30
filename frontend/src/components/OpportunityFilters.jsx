const selectBaseClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'

function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full">
      <svg
        className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by role, company, or skill"
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
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

function OpportunityFilters({
  query,
  type,
  location,
  workMode,
  locations,
  onQueryChange,
  onTypeChange,
  onLocationChange,
  onWorkModeChange,
}) {
  return (
    <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Search</span>
        <SearchInput value={query} onChange={onQueryChange} />
      </div>

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

export default OpportunityFilters