import { opportunities } from '../data/opportunities.js'

const OPPORTUNITY_ID_PATTERN = /^opportunity_\d{3,}$/
const OPPORTUNITY_TYPES = ['Internship', 'Full-time']
const WORK_MODES = ['Remote', 'Hybrid', 'On-site']

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0

const isValidDate = (value) =>
  typeof value === 'string' && !Number.isNaN(new Date(value).getTime())

const nextOpportunityId = () => {
  const highest = opportunities.reduce((max, opportunity) => {
    const parsed = Number(opportunity.id.replace('opportunity_', ''))
    return Number.isNaN(parsed) ? max : Math.max(max, parsed)
  }, 0)

  return `opportunity_${String(highest + 1).padStart(3, '0')}`
}

export const getAllOpportunities = () => opportunities

export const getOpportunityById = (id) => {
  if (!OPPORTUNITY_ID_PATTERN.test(id)) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid opportunity ID format',
    }
  }

  const opportunity = opportunities.find((entry) => entry.id === id)

  if (!opportunity) {
    return {
      ok: false,
      status: 404,
      message: 'Opportunity not found',
    }
  }

  return { ok: true, data: opportunity }
}

export const createOpportunity = (payload) => {
  const errors = validateOpportunityPayload(payload)

  if (errors.length > 0) {
    return {
      ok: false,
      status: 400,
      message: errors[0],
      errors,
    }
  }

  const opportunity = {
    id: nextOpportunityId(),
    company: payload.company.trim(),
    role: payload.role.trim(),
    domain: payload.domain.trim(),
    description: payload.description.trim(),
    opportunityType: payload.opportunityType,
    locations: payload.locations.map((location) => location.trim()),
    workMode: payload.workMode,
    requiredSkills: payload.requiredSkills.map((skill) => skill.trim()),
    deadline: payload.deadline,
    minimumCgpa: payload.minimumCgpa ?? 0,
    allowedBranches: payload.allowedBranches ?? [],
    graduationYears: payload.graduationYears ?? [],
    maximumActiveBacklogs: payload.maximumActiveBacklogs ?? 0,
  }

  opportunities.push(opportunity)

  return { ok: true, data: opportunity }
}

const validateOpportunityPayload = (payload) => {
  const errors = []

  if (!payload || typeof payload !== 'object') {
    return ['Request body must be a JSON object']
  }

  if (!isNonEmptyString(payload.company)) {
    errors.push('company is required and must be a non-empty string')
  }
  if (!isNonEmptyString(payload.role)) {
    errors.push('role is required and must be a non-empty string')
  }
  if (!isNonEmptyString(payload.domain)) {
    errors.push('domain is required and must be a non-empty string')
  }
  if (!isNonEmptyString(payload.description)) {
    errors.push('description is required and must be a non-empty string')
  }
  if (!OPPORTUNITY_TYPES.includes(payload.opportunityType)) {
    errors.push('opportunityType must be one of: Internship, Full-time')
  }
  if (!isNonEmptyArray(payload.locations)) {
    errors.push('locations is required and must be a non-empty array')
  } else if (!payload.locations.every(isNonEmptyString)) {
    errors.push('locations must be an array of non-empty strings')
  }
  if (!WORK_MODES.includes(payload.workMode)) {
    errors.push('workMode must be one of: Remote, Hybrid, On-site')
  }
  if (!isNonEmptyArray(payload.requiredSkills)) {
    errors.push('requiredSkills is required and must be a non-empty array')
  } else if (!payload.requiredSkills.every(isNonEmptyString)) {
    errors.push('requiredSkills must be an array of non-empty strings')
  }
  if (!isValidDate(payload.deadline)) {
    errors.push('deadline is required and must be a valid date string')
  }
  if (payload.minimumCgpa !== undefined) {
    const cgpa = Number(payload.minimumCgpa)
    if (Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errors.push('minimumCgpa must be a number between 0 and 10')
    }
  }
  if (payload.maximumActiveBacklogs !== undefined) {
    const backlogs = Number(payload.maximumActiveBacklogs)
    if (
      !Number.isInteger(backlogs) ||
      backlogs < 0
    ) {
      errors.push('maximumActiveBacklogs must be a non-negative integer')
    }
  }
  if (payload.allowedBranches !== undefined && !Array.isArray(payload.allowedBranches)) {
    errors.push('allowedBranches must be an array')
  } else if (
    payload.allowedBranches !== undefined &&
    !payload.allowedBranches.every(isNonEmptyString)
  ) {
    errors.push('allowedBranches must be an array of non-empty strings')
  }
  if (payload.graduationYears !== undefined && !Array.isArray(payload.graduationYears)) {
    errors.push('graduationYears must be an array')
  } else if (
    payload.graduationYears !== undefined &&
    !payload.graduationYears.every(
      (year) => Number.isInteger(Number(year)) && Number(year) >= 0,
    )
  ) {
    errors.push('graduationYears must be an array of non-negative integers')
  }

  return errors
}