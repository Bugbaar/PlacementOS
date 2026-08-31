import { applications } from '../data/applications.js'
import * as studentService from './studentService.js'
import * as opportunityService from './opportunityService.js'
import * as matchingService from './matchingService.js'

const APPLICATION_ID_PATTERN = /^application_\d{3,}$/

const nextApplicationId = () => {
  const highest = applications.reduce((max, application) => {
    const parsed = Number(application.id.replace('application_', ''))
    return Number.isNaN(parsed) ? max : Math.max(max, parsed)
  }, 0)

  return `application_${String(highest + 1).padStart(3, '0')}`
}

export const getAllApplications = () => applications

export const getApplicationsForStudent = (studentId) => {
  const studentResult = studentService.getStudentById(studentId)

  if (!studentResult.ok) {
    return { ok: false, status: studentResult.status, message: studentResult.message }
  }

  const data = applications
    .filter((application) => application.studentId === studentId)
    .map((application) => {
      const opportunityResult = opportunityService.getOpportunityById(application.opportunityId)
      return {
        ...application,
        opportunity: opportunityResult.ok ? opportunityResult.data : null,
      }
    })

  return { ok: true, data }
}

export const getApplicationsForOpportunity = (opportunityId) => {
  const opportunityResult = opportunityService.getOpportunityById(opportunityId)

  if (!opportunityResult.ok) {
    return { ok: false, status: opportunityResult.status, message: opportunityResult.message }
  }

  const data = applications
    .filter((application) => application.opportunityId === opportunityId)
    .map((application) => {
      const studentResult = studentService.getStudentById(application.studentId)
      const match = studentResult.ok
        ? matchingService.matchStudentToOpportunity(studentResult.data, opportunityResult.data)
        : null
      return {
        ...application,
        student: studentResult.ok ? studentResult.data : null,
        matchScore: match ? match.matchScore : null,
      }
    })

  return { ok: true, data }
}

export const getApplicationsReceivedCount = (opportunityId) => {
  const result = opportunityService.getOpportunityById(opportunityId)

  if (!result.ok) {
    return result
  }

  return {
    ok: true,
    count: applications.filter(
      (application) => application.opportunityId === opportunityId,
    ).length,
  }
}

const alreadyApplied = (studentId, opportunityId) =>
  applications.some(
    (application) =>
      application.studentId === studentId && application.opportunityId === opportunityId,
  )

/**
 * Backend-enforced application rule. The only way an application is created is
 * through this function, which re-runs the existing Matching Engine to confirm
 * the student is relevant AND eligible. Duplicate applications are rejected.
 */
export const applyToOpportunity = (studentId, opportunityId) => {
  const studentResult = studentService.getStudentById(studentId)

  if (!studentResult.ok) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_STUDENT_ID',
      message: studentResult.message,
    }
  }

  const opportunityResult = opportunityService.getOpportunityById(opportunityId)

  if (!opportunityResult.ok) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_OPPORTUNITY_ID',
      message: opportunityResult.message,
    }
  }

  if (opportunityResult.data.closed) {
    return {
      ok: false,
      status: 403,
      code: 'OPPORTUNITY_CLOSED',
      message: 'This opportunity is no longer accepting applications',
    }
  }

  if (alreadyApplied(studentId, opportunityId)) {
    return {
      ok: false,
      status: 409,
      code: 'ALREADY_APPLIED',
      message: 'You have already applied to this opportunity',
    }
  }

  const match = matchingService.matchStudentToOpportunity(
    studentResult.data,
    opportunityResult.data,
  )

  if (!match.relevant || !match.eligible) {
    return {
      ok: false,
      status: 403,
      code: 'NOT_APPLICABLE',
      message: !match.relevant
        ? 'You must be a relevant match to apply to this opportunity'
        : 'You do not meet the eligibility criteria for this opportunity',
      data: {
        relevant: match.relevant,
        eligible: match.eligible,
        matchScore: match.matchScore,
      },
    }
  }

  const application = {
    id: nextApplicationId(),
    studentId,
    opportunityId,
    status: 'Applied',
    appliedAt: new Date().toISOString(),
  }

  applications.push(application)

  return { ok: true, data: application }
}

export { APPLICATION_ID_PATTERN }
