import { getAllOpportunities } from './opportunityService.js'

/**
 * Opportunity Matching Engine
 *
 * Deterministic, explainable scoring. A student is matched against an
 * opportunity across four weighted dimensions:
 *
 *   skills           -> 50 points  (proportional to required skills matched)
 *   role/domain      -> 20 points  (role or domain overlaps a preference)
 *   location         -> 15 points  (location preference matched, or Remote)
 *   opportunity type -> 15 points  (Internship / Full-time preference)
 *   TOTAL            -> 100 points
 *
 * A match is "relevant" when matchScore >= RELEVANCE_THRESHOLD (50).
 * Eligibility (CGPA, branch, graduation year, backlogs) is computed
 * independently of relevance and never affects the match score.
 *
 * Empty preference arrays are treated as "no restriction" and count as
 * satisfied for the affected dimension. Skill comparison is case-insensitive
 * and duplicate skills are de-duplicated.
 */

export const MATCH_WEIGHTS = Object.freeze({
  skills: 50,
  roleDomain: 20,
  location: 15,
  opportunityType: 15,
})

export const RELEVANCE_THRESHOLD = 50

const normalize = (value) => String(value ?? '').trim().toLowerCase()

const normalizeList = (list) =>
  [...new Set((list ?? []).map(normalize))].filter(Boolean)

const getSkillMatch = (studentSkills, requiredSkills) => {
  const student = normalizeList(studentSkills)
  const required = normalizeList(requiredSkills)

  const matched = required.filter((skill) => student.includes(skill))
  const missing = required.filter((skill) => !student.includes(skill))

  const percentage =
    required.length === 0
      ? 100
      : Math.round((matched.length / required.length) * 1000) / 10

  const score = Math.round(percentage * (MATCH_WEIGHTS.skills / 100) * 10) / 10

  return { score, percentage, matched, missing }
}

const getRoleDomainMatch = (student, opportunity) => {
  const preferredRoles = (student.preferredRoles ?? []).map(normalize).filter(Boolean)
  const preferredDomains = (student.preferredDomains ?? []).map(normalize).filter(Boolean)

  if (preferredRoles.length === 0 && preferredDomains.length === 0) {
    return { matched: true }
  }

  const role = normalize(opportunity.role)
  const domain = normalize(opportunity.domain)

  const roleMatched =
    role !== '' && preferredRoles.some((pref) => role.includes(pref) || pref.includes(role))
  const domainMatched =
    domain !== '' && preferredDomains.some((pref) => domain.includes(pref) || pref.includes(domain))

  return { matched: roleMatched || domainMatched }
}

const getLocationMatch = (student, opportunity) => {
  const preferredLocations = (student.preferredLocations ?? []).map(normalize).filter(Boolean)

  if (preferredLocations.length === 0) {
    return { matched: true }
  }

  if (normalize(opportunity.workMode) === 'remote') {
    return { matched: true }
  }

  const opportunityLocations = (opportunity.locations ?? []).map(normalize).filter(Boolean)

  const matched = opportunityLocations.some((location) =>
    preferredLocations.some(
      (preferred) => location.includes(preferred) || preferred.includes(location),
    ),
  )

  return { matched }
}

const getTypeMatch = (student, opportunity) => {
  const preferred = (student.preferredOpportunityTypes ?? []).map(normalize).filter(Boolean)

  if (preferred.length === 0) {
    return { matched: true }
  }

  return { matched: preferred.includes(normalize(opportunity.opportunityType)) }
}

const evaluateCgpa = (student, opportunity) => {
  const minimum = opportunity.minimumCgpa ?? 0
  const passed = Number(student.cgpa) >= Number(minimum)

  return {
    passed,
    reason: passed
      ? `CGPA ${student.cgpa} meets the minimum of ${minimum}`
      : `CGPA ${student.cgpa} is below the minimum of ${minimum}`,
  }
}

const evaluateBranch = (student, opportunity) => {
  const allowed = (opportunity.allowedBranches ?? []).map(normalize).filter(Boolean)

  if (allowed.length === 0) {
    return { passed: true, reason: 'No branch restriction' }
  }

  const passed = allowed.includes(normalize(student.branch))

  return {
    passed,
    reason: passed
      ? `Branch ${student.branch} is allowed`
      : `Branch ${student.branch} is not in the allowed branches`,
  }
}

const evaluateGraduationYear = (student, opportunity) => {
  const years = opportunity.graduationYears ?? []

  if (years.length === 0) {
    return { passed: true, reason: 'No graduation year restriction' }
  }

  const passed = years.includes(Number(student.graduationYear))

  return {
    passed,
    reason: passed
      ? `Graduation year ${student.graduationYear} is allowed`
      : `Graduation year ${student.graduationYear} is not in the allowed years`,
  }
}

const evaluateBacklogs = (student, opportunity) => {
  const limit = opportunity.maximumActiveBacklogs

  if (limit === undefined || limit === null) {
    return { passed: true, reason: 'No backlog restriction' }
  }

  const passed = Number(student.activeBacklogs) <= Number(limit)

  return {
    passed,
    reason: passed
      ? `Active backlogs ${student.activeBacklogs} are within the limit of ${limit}`
      : `Active backlogs ${student.activeBacklogs} exceed the limit of ${limit}`,
  }
}

const getEligibility = (student, opportunity) => {
  const cgpa = evaluateCgpa(student, opportunity)
  const branch = evaluateBranch(student, opportunity)
  const graduationYear = evaluateGraduationYear(student, opportunity)
  const backlogs = evaluateBacklogs(student, opportunity)

  return {
    cgpa,
    branch,
    graduationYear,
    backlogs,
    passed: cgpa.passed && branch.passed && graduationYear.passed && backlogs.passed,
  }
}

export const matchStudentToOpportunity = (student, opportunity) => {
  const skills = getSkillMatch(student.skills, opportunity.requiredSkills)
  const roleDomain = getRoleDomainMatch(student, opportunity)
  const location = getLocationMatch(student, opportunity)
  const opportunityType = getTypeMatch(student, opportunity)

  const matchScore = Math.round(
    (skills.score +
      (roleDomain.matched ? MATCH_WEIGHTS.roleDomain : 0) +
      (location.matched ? MATCH_WEIGHTS.location : 0) +
      (opportunityType.matched ? MATCH_WEIGHTS.opportunityType : 0)) *
      10,
  ) / 10

  const eligibility = getEligibility(student, opportunity)

  return {
    studentId: student.id,
    opportunityId: opportunity.id,
    matchScore,
    relevant: matchScore >= RELEVANCE_THRESHOLD,
    eligible: eligibility.passed,
    matchingDetails: {
      skills: {
        score: skills.score,
        percentage: skills.percentage,
        matched: skills.matched,
        missing: skills.missing,
      },
      roleDomain,
      location,
      opportunityType,
    },
    eligibilityDetails: {
      cgpa: eligibility.cgpa,
      branch: eligibility.branch,
      graduationYear: eligibility.graduationYear,
      backlogs: eligibility.backlogs,
    },
  }
}

export const getStudentMatches = (student) =>
  getAllOpportunities()
    .map((opportunity) => matchStudentToOpportunity(student, opportunity))
    .sort((a, b) => b.matchScore - a.matchScore)