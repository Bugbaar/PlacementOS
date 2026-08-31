import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import * as applicationService from '../src/services/applicationService.js'
import * as studentService from '../src/services/studentService.js'
import * as matchingService from '../src/services/matchingService.js'
import { opportunities } from '../src/data/opportunities.js'
import { applications, resetApplications } from '../src/data/applications.js'
import { students } from '../src/data/students.js'

const alex = students.find((student) => student.id === 'student_005')
const vikram = students.find((student) => student.id === 'student_004')
const cloudSphere = opportunities.find((opportunity) => opportunity.id === 'opportunity_001')

const craftOpportunity = (overrides = {}) => ({
  id: 'opportunity_test_app',
  company: 'AppCo',
  role: 'Full Stack Developer',
  domain: 'Web Development',
  description: 'A crafted opportunity for application tests.',
  opportunityType: 'Internship',
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

describe('applicationService.applyToOpportunity', () => {
  beforeEach(() => {
    resetApplications()
  })

  test('creates an application for a relevant and eligible student', () => {
    const result = applicationService.applyToOpportunity(alex.id, cloudSphere.id)

    assert.equal(result.ok, true)
    assert.equal(result.data.studentId, 'student_005')
    assert.equal(result.data.opportunityId, 'opportunity_001')
    assert.equal(result.data.status, 'Applied')
    assert.ok(result.data.appliedAt)
    assert.ok(result.data.id.startsWith('application_'))
  })

  test('rejects a duplicate application', () => {
    applicationService.applyToOpportunity(alex.id, cloudSphere.id)
    const result = applicationService.applyToOpportunity(alex.id, cloudSphere.id)

    assert.equal(result.ok, false)
    assert.equal(result.code, 'ALREADY_APPLIED')
    assert.equal(result.status, 409)
  })

  test('rejects an application from a non-relevant student', () => {
    const result = applicationService.applyToOpportunity(vikram.id, cloudSphere.id)

    assert.equal(result.ok, false)
    assert.equal(result.code, 'NOT_APPLICABLE')
    assert.equal(result.status, 403)
    assert.equal(result.data.relevant, false)
  })

  test('rejects an application from an ineligible student', () => {
    const techNova = opportunities.find((opportunity) => opportunity.id === 'opportunity_002')

    const before = matchingService.matchStudentToOpportunity(alex, techNova)
    assert.equal(before.relevant, true)
    assert.equal(before.eligible, false)

    const result = applicationService.applyToOpportunity(alex.id, techNova.id)

    assert.equal(result.ok, false)
    assert.equal(result.code, 'NOT_APPLICABLE')
    assert.equal(result.status, 403)
    assert.equal(result.data.eligible, false)
  })

  test('rejects an invalid student id', () => {
    const result = applicationService.applyToOpportunity('student_999', cloudSphere.id)

    assert.equal(result.ok, false)
    assert.equal(result.code, 'INVALID_STUDENT_ID')
  })

  test('rejects an invalid opportunity id', () => {
    const result = applicationService.applyToOpportunity(alex.id, 'opportunity_999')

    assert.equal(result.ok, false)
    assert.equal(result.code, 'INVALID_OPPORTUNITY_ID')
  })

  test('application is only counted once for a student/opportunity pair', () => {
    applicationService.applyToOpportunity(alex.id, cloudSphere.id)
    applicationService.applyToOpportunity(alex.id, cloudSphere.id)

    const count = applications.filter(
      (application) =>
        application.studentId === alex.id && application.opportunityId === cloudSphere.id,
    ).length

    assert.equal(count, 1)
  })
})

describe('applicationService.getApplicationsReceivedCount', () => {
  beforeEach(() => {
    resetApplications()
  })

  test('returns zero when there are no applications', () => {
    const result = applicationService.getApplicationsReceivedCount(cloudSphere.id)
    assert.equal(result.ok, true)
    assert.equal(result.count, 0)
  })

  test('reflects real application data', () => {
    applicationService.applyToOpportunity(alex.id, cloudSphere.id)
    const result = applicationService.getApplicationsReceivedCount(cloudSphere.id)
    assert.equal(result.count, 1)
  })
})

describe('studentService.updateStudent', () => {
  beforeEach(() => {
    resetApplications()
    studentService.updateStudent('student_005', {
      cgpa: 8.2,
      skills: alex.skills,
      preferredRoles: alex.preferredRoles,
      preferredDomains: alex.preferredDomains,
      preferredLocations: alex.preferredLocations,
      preferredOpportunityTypes: alex.preferredOpportunityTypes,
    })
  })

  test('updates skills and preferences', () => {
    const result = studentService.updateStudent('student_005', {
      skills: ['JavaScript', 'React', 'Go'],
      preferredRoles: ['Frontend Developer'],
    })

    assert.equal(result.ok, true)
    assert.deepEqual(result.data.skills, ['JavaScript', 'React', 'Go'])
    assert.deepEqual(result.data.preferredRoles, ['Frontend Developer'])
  })

  test('match scores change after profile update', () => {
    const opportunity = craftOpportunity({
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'CSS'],
    })

    const before = matchingService.matchStudentToOpportunity(alex, opportunity)

    studentService.updateStudent('student_005', {
      skills: ['Go', 'Python', 'SQL'],
      preferredRoles: ['Design Engineer'],
      preferredDomains: ['Embedded Systems'],
      preferredLocations: ['Pune'],
      preferredOpportunityTypes: ['Full-time'],
    })

    const updated = studentService.getStudentById('student_005').data
    const after = matchingService.matchStudentToOpportunity(updated, opportunity)

    assert.ok(after.matchScore < before.matchScore)

    studentService.updateStudent('student_005', {
      skills: alex.skills,
      preferredRoles: alex.preferredRoles,
      preferredDomains: alex.preferredDomains,
      preferredLocations: alex.preferredLocations,
      preferredOpportunityTypes: alex.preferredOpportunityTypes,
    })
  })

  test('rejects invalid cgpa', () => {
    const result = studentService.updateStudent('student_005', { cgpa: 12 })
    assert.equal(result.ok, false)
    assert.equal(result.status, 400)
  })

  test('rejects invalid preferredOpportunityTypes', () => {
    const result = studentService.updateStudent('student_005', {
      preferredOpportunityTypes: ['Contract'],
    })
    assert.equal(result.ok, false)
    assert.equal(result.status, 400)
  })

  test('rejects invalid skills array', () => {
    const result = studentService.updateStudent('student_005', { skills: ['', 'React'] })
    assert.equal(result.ok, false)
    assert.equal(result.status, 400)
  })

  test('returns 404 for unknown student', () => {
    const result = studentService.updateStudent('student_999', { cgpa: 8 })
    assert.equal(result.ok, false)
    assert.equal(result.status, 404)
  })
})
