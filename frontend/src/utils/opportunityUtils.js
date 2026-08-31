export function filterOpportunities(
  opportunities,
  { query = '', type = 'All', location = 'All', workMode = 'All' } = {},
) {
  const q = query.trim().toLowerCase()

  return opportunities.filter((opportunity) => {
    const matchesQuery =
      !q ||
      opportunity.role.toLowerCase().includes(q) ||
      opportunity.company.toLowerCase().includes(q) ||
      opportunity.domain.toLowerCase().includes(q) ||
      (opportunity.requiredSkills ?? []).some((skill) =>
        skill.toLowerCase().includes(q),
      )

    const matchesType = type === 'All' || opportunity.opportunityType === type
    const matchesLocation =
      location === 'All' || (opportunity.locations ?? []).includes(location)
    const matchesWorkMode = workMode === 'All' || opportunity.workMode === workMode

    return matchesQuery && matchesType && matchesLocation && matchesWorkMode
  })
}

export function getUniqueLocations(opportunities) {
  return [...new Set(opportunities.flatMap((opportunity) => opportunity.locations ?? []))]
}