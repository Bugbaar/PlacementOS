import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import * as notificationService from '../src/services/notificationService.js'
import * as matchingService from '../src/services/matchingService.js'
import { students } from '../src/data/students.js'
import { opportunities } from '../src/data/opportunities.js'
import { notifications, resetNotifications } from '../src/data/notifications.js'

const ananya = students.find((student) => student.id === 'student_001')
const rohan = students.find((student) => student.id === 'student_002')
const vikram = students.find((student) => student.id === 'student_004')

const craftOpportunity = (overrides = {}) => ({
  id: 'opportunity_test_a',
  company: 'CraftCo',
  role: 'Frontend Developer',
  domain: 'Web Development',
  description: 'A crafted opportunity for tests.',
  opportunityType: 'Internship',
  locations: ['Bengaluru'],
  workMode: 'On-site',
  requiredSkills: ['React', 'JavaScript'],
  deadline: '2026-12-31',
  minimumCgpa: 0,
  allowedBranches: [],
  graduationYears: [],
  maximumActiveBacklogs: null,
  ...overrides,
})

describe('notificationService.createNotificationsForOpportunity', () => {
  beforeEach(() => {
    resetNotifications()
  })

  test('relevant and eligible student receives a notification', () => {
    const created = notificationService.createNotificationsForOpportunity(craftOpportunity())

    const notification = created.find((entry) => entry.studentId === ananya.id)

    assert.ok(notification, 'Ananya should receive a notification')
    assert.equal(notification.opportunityId, 'opportunity_test_a')
    assert.equal(notification.type, 'opportunity_match')
    assert.equal(notification.read, false)
    assert.equal(notification.matchScore, 100)
    assert.ok(notification.matchScore >= notificationService.MIN_MATCH_SCORE_FOR_NOTIFICATION)
  })

  test('relevant but ineligible student does not receive a notification', () => {
    const opportunity = craftOpportunity({
      role: 'Design Engineer',
      domain: 'Product Design',
      requiredSkills: ['Python'],
      locations: ['Pune'],
      allowedBranches: ['Computer Science and Engineering'],
    })

    const created = notificationService.createNotificationsForOpportunity(opportunity)

    assert.equal(created.length, 0, 'No student passes relevance AND eligibility')

    const match = matchingService.matchStudentToOpportunity(vikram, opportunity)
    assert.equal(match.eligible, false)
    assert.equal(match.matchScore, 100)
    const vikramNotified = created.find((entry) => entry.studentId === vikram.id)
    assert.equal(vikramNotified, undefined)
  })

  test('low match score does not trigger a notification', () => {
    const opportunity = craftOpportunity({
      role: 'Data Entry Operator',
      domain: 'Healthcare',
      requiredSkills: ['SolidWorks'],
      locations: ['Noida'],
    })

    const match = matchingService.matchStudentToOpportunity(vikram, opportunity)
    assert.ok(match.matchScore < notificationService.MIN_MATCH_SCORE_FOR_NOTIFICATION)

    const created = notificationService.createNotificationsForOpportunity(opportunity)

    assert.equal(created.length, 0)
  })

  test('relevant and eligible but below the notification threshold -> no notification', () => {
    const opportunity = craftOpportunity({
      id: 'opportunity_test_gap',
      role: 'Backend Developer',
      domain: 'FinTech',
      opportunityType: 'Full-time',
      locations: ['Bengaluru'],
      workMode: 'On-site',
      requiredSkills: ['Python', 'SQL', 'AWS'],
      minimumCgpa: 7,
      allowedBranches: ['Computer Science and Engineering', 'Information Technology'],
      graduationYears: [2026],
      maximumActiveBacklogs: 0,
    })

    const rohanMatch = matchingService.matchStudentToOpportunity(rohan, opportunity)
    assert.equal(rohanMatch.relevant, true)
    assert.equal(rohanMatch.eligible, true)
    assert.ok(rohanMatch.matchScore >= 50)
    assert.ok(rohanMatch.matchScore < notificationService.MIN_MATCH_SCORE_FOR_NOTIFICATION)

    const ananyaMatch = matchingService.matchStudentToOpportunity(ananya, opportunity)
    assert.equal(ananyaMatch.relevant, true)
    assert.equal(ananyaMatch.eligible, true)
    assert.ok(ananyaMatch.matchScore < notificationService.MIN_MATCH_SCORE_FOR_NOTIFICATION)

    const created = notificationService.createNotificationsForOpportunity(opportunity)

    assert.equal(created.length, 0, 'no student crosses the notification threshold')
  })

  test('not relevant opportunity -> no notification', () => {
    const opportunity = craftOpportunity({
      id: 'opportunity_test_irrelevant',
      role: 'Embedded Firmware Engineer',
      domain: 'Robotics',
      locations: ['Chennai'],
      workMode: 'On-site',
      requiredSkills: ['C', 'Embedded C'],
      minimumCgpa: 7,
      allowedBranches: ['Computer Science and Engineering', 'Information Technology'],
      graduationYears: [2026],
      maximumActiveBacklogs: 0,
    })

    const match = matchingService.matchStudentToOpportunity(ananya, opportunity)
    assert.equal(match.relevant, false)

    const created = notificationService.createNotificationsForOpportunity(opportunity)

    const ananyaNotified = created.find((entry) => entry.studentId === ananya.id)
    assert.equal(ananyaNotified, undefined)
    assert.equal(created.length, 0, 'expected no qualifying students at all')
  })

  test('a student is never notified twice for the same opportunity', () => {
    const opportunity = craftOpportunity({ id: 'opportunity_test_dedup' })

    const first = notificationService.createNotificationsForOpportunity(opportunity)
    const second = notificationService.createNotificationsForOpportunity(opportunity)

    assert.ok(first.length >= 1)
    assert.equal(second.length, 0)

    const result = notificationService.getNotificationsForStudent(ananya.id)
    const duplicates = result.data.filter(
      (entry) => entry.opportunityId === opportunity.id,
    )
    assert.equal(duplicates.length, 1)
  })

  test('duplicate notifications are prevented', () => {
    const opportunity = craftOpportunity()

    notificationService.createNotificationsForOpportunity(opportunity)
    notificationService.createNotificationsForOpportunity(opportunity)

    const again = notificationService.createNotificationsForOpportunity(opportunity)

    assert.equal(again.length, 0, 'no new notifications should be created')

    const result = notificationService.getNotificationsForStudent(ananya.id)
    const duplicates = result.data.filter((entry) => entry.opportunityId === opportunity.id)

    assert.equal(duplicates.length, 1)
  })
})

describe('notification read flow', () => {
  beforeEach(() => {
    resetNotifications()
  })

  const seedRaw = (id, studentId, opportunityId, createdAt, read) => {
    notifications.push({
      id,
      studentId,
      opportunityId,
      type: 'opportunity_match',
      title: 'Seed notification',
      message: 'Seeded directly for a deterministic test.',
      matchScore: 90,
      read,
      createdAt,
    })
  }

  const seedNotifications = () => {
    const opportunity = craftOpportunity({ id: 'opportunity_test_b' })
    const created = notificationService.createNotificationsForOpportunity(opportunity)
    const ananyaNotification = created.find((entry) => entry.studentId === ananya.id)
    notificationService.createNotificationsForOpportunity(
      craftOpportunity({ id: 'opportunity_test_c' }),
    )
    return ananyaNotification
  }

  test('notifications are returned newest first with accurate unread count', () => {
    seedRaw('notification_901', ananya.id, 'opportunity_001', '2026-08-01T00:00:00.000Z', false)
    seedRaw('notification_902', ananya.id, 'opportunity_002', '2026-08-10T00:00:00.000Z', true)
    seedRaw('notification_903', ananya.id, 'opportunity_004', '2026-08-20T00:00:00.000Z', false)

    const result = notificationService.getNotificationsForStudent(ananya.id)

    assert.equal(result.ok, true)
    assert.equal(result.data.length, 3)
    assert.deepEqual(
      result.data.map((entry) => entry.id),
      ['notification_903', 'notification_902', 'notification_901'],
    )
    assert.equal(result.unreadCount, 2)
  })

  test('notifications only ever belong to the requested student', () => {
    notificationService.createNotificationsForOpportunity(
      craftOpportunity({ id: 'opportunity_test_scope' }),
    )

    const rohanResult = notificationService.getNotificationsForStudent(rohan.id)
    const ananyaResult = notificationService.getNotificationsForStudent(ananya.id)

    assert.ok(rohanResult.data.length >= 1)
    assert.ok(ananyaResult.data.length >= 1)
    assert.ok(rohanResult.data.every((entry) => entry.studentId === rohan.id))
    assert.ok(ananyaResult.data.every((entry) => entry.studentId === ananya.id))
  })

  test('read-all only clears the target student, others are unaffected', () => {
    notificationService.createNotificationsForOpportunity(
      craftOpportunity({ id: 'opportunity_test_readall' }),
    )

    assert.equal(notificationService.getNotificationsForStudent(vikram.id).unreadCount, 0)

    const rohanBefore = notificationService.getNotificationsForStudent(rohan.id)
    assert.ok(rohanBefore.unreadCount >= 1)

    const result = notificationService.markAllNotificationsAsReadForStudent(ananya.id)

    assert.equal(result.ok, true)
    assert.ok(result.count >= 1)
    assert.equal(notificationService.getNotificationsForStudent(ananya.id).unreadCount, 0)
    assert.ok(notificationService.getNotificationsForStudent(rohan.id).unreadCount >= 1)
  })

  test('mark a notification as read', () => {
    const notification = seedNotifications()

    const before = notificationService.getNotificationsForStudent(ananya.id)
    assert.ok(before.unreadCount >= 1)

    const result = notificationService.markNotificationAsRead(notification.id)

    assert.equal(result.ok, true)
    assert.equal(result.data.read, true)

    const after = notificationService.getNotificationsForStudent(ananya.id)
    assert.equal(after.data.find((entry) => entry.id === notification.id).read, true)
  })

  test('marking invalid notification ID returns an error', () => {
    const result = notificationService.markNotificationAsRead('123')

    assert.equal(result.ok, false)
    assert.equal(result.status, 400)
  })

  test('marking a missing notification returns 404', () => {
    const result = notificationService.markNotificationAsRead('notification_999')

    assert.equal(result.ok, false)
    assert.equal(result.status, 404)
  })

  test('read-all marks every notification as read', () => {
    seedNotifications()

    const result = notificationService.markAllNotificationsAsReadForStudent(ananya.id)

    assert.equal(result.ok, true)
    assert.ok(result.count >= 1)

    const after = notificationService.getNotificationsForStudent(ananya.id)
    assert.equal(after.unreadCount, 0)
    assert.ok(after.data.every((entry) => entry.read))
  })

  test('getNotificationsForStudent includes opportunity metadata', () => {
    notificationService.createNotificationsForOpportunity(
      opportunities.find((entry) => entry.id === 'opportunity_001'),
    )

    const result = notificationService.getNotificationsForStudent(ananya.id)

    assert.equal(result.ok, true)
    assert.ok(result.data.length >= 1)
    for (const notification of result.data) {
      assert.ok(notification.opportunity)
      assert.equal(notification.opportunity.id, notification.opportunityId)
    }
  })
})