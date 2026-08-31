import * as studentService from './studentService.js'
import * as matchingService from './matchingService.js'
import { MIN_MATCH_SCORE_FOR_NOTIFICATION } from './notificationService.js'
import * as applicationService from './applicationService.js'

/**
 * Recruiter analytics for an opportunity.
 *
 * Matching metrics are computed deterministically by re-running the existing
 * Opportunity Matching Engine and notification rule (MIN_MATCH_SCORE_FOR_NOTIFICATION)
 * against every student. No matching or notification logic is duplicated here and no
 * values are invented. "studentsNotified" mirrors the exact condition used when a
 * notification is generated: relevant AND eligible AND matchScore >= threshold.
 * "applicationsReceived" comes from real application data (never invented).
 */
export const getOpportunityAnalytics = (opportunity) => {
  const students = studentService.getAllStudents()

  const matches = students.map((student) =>
    matchingService.matchStudentToOpportunity(student, opportunity),
  )

  const relevantStudents = matches.filter((match) => match.relevant).length
  const eligibleStudents = matches.filter((match) => match.eligible).length
  const studentsNotified = matches.filter(
    (match) =>
      match.relevant &&
      match.eligible &&
      match.matchScore >= MIN_MATCH_SCORE_FOR_NOTIFICATION,
  ).length

  const applicationsReceived = applicationService.getApplicationsReceivedCount(
    opportunity.id,
  ).count

  return {
    opportunityId: opportunity.id,
    totalStudentsEvaluated: students.length,
    relevantStudents,
    eligibleStudents,
    studentsNotified,
    applicationsReceived,
  }
}
