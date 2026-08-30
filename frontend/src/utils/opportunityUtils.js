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
      opportunity.skills.some((skill) => skill.toLowerCase().includes(q))

    const matchesType = type === 'All' || opportunity.type === type
    const matchesLocation = location === 'All' || opportunity.location === location
    const matchesWorkMode = workMode === 'All' || opportunity.workMode === workMode

    return matchesQuery && matchesType && matchesLocation && matchesWorkMode
  })
}

export function getEligibility(opportunity, studentSkills) {
  const matchedSkills = opportunity.skills.filter((skill) =>
    studentSkills.includes(skill),
  )

  if (matchedSkills.length === 0) {
    return { status: 'none', matchedCount: 0 }
  }
  if (matchedSkills.length === opportunity.skills.length) {
    return { status: 'eligible', matchedCount: matchedSkills.length }
  }
  return { status: 'partial', matchedCount: matchedSkills.length }
}

export function getUniqueLocations(opportunities) {
  return [...new Set(opportunities.map((opportunity) => opportunity.location))]
}

export function getDaysUntil(deadline) {
  const now = new Date()
  const target = new Date(deadline)
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000)
}