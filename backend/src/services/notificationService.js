import * as studentService from './studentService.js'
import * as opportunityService from './opportunityService.js'
import * as matchingService from './matchingService.js'
import { notifications } from '../data/notifications.js'

/**
 * Minimum match score required before a student is notified.
 * A notification is only generated when ALL of the following hold:
 *   - the opportunity is relevant to the student
 *   - the student is eligible
 *   - the match score meets this threshold
 */
export const MIN_MATCH_SCORE_FOR_NOTIFICATION = 70

const NOTIFICATION_ID_PATTERN = /^notification_\d{3,}$/

const nextNotificationId = () => {
  const highest = notifications.reduce((max, notification) => {
    const parsed = Number(notification.id.replace('notification_', ''))
    return Number.isNaN(parsed) ? max : Math.max(max, parsed)
  }, 0)

  return `notification_${String(highest + 1).padStart(3, '0')}`
}

const hasDuplicate = (studentId, opportunityId) =>
  notifications.some(
    (notification) =>
      notification.studentId === studentId && notification.opportunityId === opportunityId,
  )

export const createNotificationsForOpportunity = (opportunity) => {
  const created = []
  const students = studentService.getAllStudents()

  for (const student of students) {
    if (hasDuplicate(student.id, opportunity.id)) {
      continue
    }

    const match = matchingService.matchStudentToOpportunity(student, opportunity)

    const shouldNotify =
      match.relevant &&
      match.eligible &&
      match.matchScore >= MIN_MATCH_SCORE_FOR_NOTIFICATION

    if (!shouldNotify) {
      continue
    }

    const notification = {
      id: nextNotificationId(),
      studentId: student.id,
      opportunityId: opportunity.id,
      type: 'opportunity_match',
      title: `New opportunity: ${opportunity.role} at ${opportunity.company}`,
      message: `A new ${opportunity.role} role at ${opportunity.company} matches your profile with a ${match.matchScore}% match score.`,
      matchScore: match.matchScore,
      read: false,
      createdAt: new Date().toISOString(),
    }

    notifications.push(notification)
    created.push(notification)
  }

  return created
}

export const getNotificationsForStudent = (studentId) => {
  const studentResult = studentService.getStudentById(studentId)

  if (!studentResult.ok) {
    return { ok: false, status: studentResult.status, message: studentResult.message }
  }

  const idRank = (notification) =>
    Number(notification.id.replace('notification_', ''))

  const list = notifications
    .filter((notification) => notification.studentId === studentId)
    .slice()
    .sort((a, b) => {
      const timeDiff = new Date(b.createdAt) - new Date(a.createdAt)
      return timeDiff !== 0 ? timeDiff : idRank(b) - idRank(a)
    })

  const data = list.map((notification) => {
    const opportunityResult = opportunityService.getOpportunityById(notification.opportunityId)
    return {
      ...notification,
      opportunity: opportunityResult.ok ? opportunityResult.data : null,
    }
  })

  const unreadCount = data.filter((notification) => !notification.read).length

  return { ok: true, data, unreadCount }
}

export const markNotificationAsRead = (notificationId) => {
  if (!NOTIFICATION_ID_PATTERN.test(notificationId)) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid notification ID format',
    }
  }

  const notification = notifications.find((entry) => entry.id === notificationId)

  if (!notification) {
    return {
      ok: false,
      status: 404,
      message: 'Notification not found',
    }
  }

  notification.read = true
  notification.readAt = new Date().toISOString()

  return { ok: true, data: notification }
}

export const markAllNotificationsAsReadForStudent = (studentId) => {
  const studentResult = studentService.getStudentById(studentId)

  if (!studentResult.ok) {
    return { ok: false, status: studentResult.status, message: studentResult.message }
  }

  const updated = notifications.filter(
    (notification) => notification.studentId === studentId && !notification.read,
  )

  for (const notification of updated) {
    notification.read = true
    notification.readAt = new Date().toISOString()
  }

  return { ok: true, count: updated.length }
}