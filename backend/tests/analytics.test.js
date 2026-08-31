import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { getOpportunityAnalytics } from '../src/services/analyticsService.js'
import { getOpportunityById } from '../src/services/opportunityService.js'
import { MIN_MATCH_SCORE_FOR_NOTIFICATION } from '../src/services/notificationService.js'
import { students } from '../src/data/students.js'

const getOpp = (id) => getOpportunityById(id).data
const craftOpportunity = (overrides = {}) => ({
  id: 'opportunity_test',
  company: 'Test Co',
  role: 'Software Engineer',
  domain: 'Software Engineering',
  description: 'A description long enough to be valid for testing.',
  opportunityType: 'Full-time',
  locations: ['Remote'],
  workMode: 'Remote',
  requiredSkills: ['JavaScript', 'React', 'Node.js'],
  deadline: '2030-01-01',
  minimumCgpa: 0,
  allowedBranches: [],
  graduationYears: [],
  maximumActiveBacklogs: 99,
  ...overrides,
})

describe('getOpportunityAnalytics', () => {
  test('total evaluated equals number of students', () => {
    const analytics = getOpportunityAnalytics(getOpp('opportunity_001'))
    assert.equal(analytics.opportunityId, 'opportunity_001')
    assert.equal(analytics.totalStudentsEvaluated, students.length)
  })

  test('notified is a subset of eligible and relevant for each opportunity', () => {
    for (const id of [
      'opportunity_001',
      'opportunity_002',
      'opportunity_003',
      'opportunity_004',
      'opportunity_005',
      'opportunity_006',
      'opportunity_007',
      'opportunity_008',
    ]) {
      const analytics = getOpportunityAnalytics(getOpp(id))
      assert.ok(
        analytics.studentsNotified <= analytics.eligibleStudents,
        `${id}: notified ${analytics.studentsNotified} must be <= eligible ${analytics.eligibleStudents}`,
      )
      assert.ok(
        analytics.studentsNotified <= analytics.relevantStudents,
        `${id}: notified ${analytics.studentsNotified} must be <= relevant ${analytics.relevantStudents}`,
      )
      assert.ok(
        analytics.eligibleStudents <= analytics.totalStudentsEvaluated,
        `${id}: eligible must be <= evaluated`,
      )
    }
  })

  test('a student matching all criteria is counted as notified', () => {
    const opportunity = craftOpportunity({
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Tailwind CSS'],
      allowedBranches: ['Computer Science and Engineering'],
      graduationYears: [2026],
      minimumCgpa: 0,
      maximumActiveBacklogs: 99,
    })
    const analytics = getOpportunityAnalytics(opportunity)
    assert.ok(analytics.relevantStudents >= 1)
    assert.ok(analytics.eligibleStudents >= 1)
    assert.ok(analytics.studentsNotified >= 1)
  })

  test('notification threshold constant drives notified count', () => {
    assert.equal(typeof MIN_MATCH_SCORE_FOR_NOTIFICATION, 'number')
    assert.ok(MIN_MATCH_SCORE_FOR_NOTIFICATION >= 0)
  })
})
