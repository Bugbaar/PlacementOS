import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  matchStudentToOpportunity,
  getStudentMatches,
  MATCH_WEIGHTS,
  RELEVANCE_THRESHOLD,
} from '../src/services/matchingService.js'
import { students } from '../src/data/students.js'
import { opportunities } from '../src/data/opportunities.js'

const ananya = students.find((student) => student.id === 'student_001')
const vikram = students.find((student) => student.id === 'student_004')
const cloudSphere = opportunities.find((opportunity) => opportunity.id === 'opportunity_001')
const techNova = opportunities.find((opportunity) => opportunity.id === 'opportunity_002')
const dataForge = opportunities.find((opportunity) => opportunity.id === 'opportunity_003')

const craftStudent = (overrides = {}) => ({
  id: 'student_test',
  name: 'Test Student',
  email: 'test@example.edu',
  branch: 'Computer Science and Engineering',
  cgpa: 9.0,
  graduationYear: 2027,
  activeBacklogs: 0,
  skills: [],
  preferredRoles: [],
  preferredDomains: [],
  preferredLocations: [],
  preferredOpportunityTypes: [],
  ...overrides,
})

describe('matchStudentToOpportunity', () => {
  test('high skill match and eligible student is relevant and eligible', () => {
    const result = matchStudentToOpportunity(ananya, cloudSphere)

    assert.equal(result.studentId, 'student_001')
    assert.equal(result.opportunityId, 'opportunity_001')
    assert.ok(result.matchScore >= 70)
    assert.ok(result.matchScore <= 100)
    assert.equal(result.relevant, true)
    assert.equal(result.eligible, true)
    assert.deepEqual(result.matchingDetails.skills.matched, ['react', 'javascript', 'git'])
    assert.deepEqual(result.matchingDetails.skills.missing, ['css'])
    assert.equal(result.matchingDetails.roleDomain.matched, true)
    assert.equal(result.matchingDetails.location.matched, true)
    assert.equal(result.matchingDetails.opportunityType.matched, true)
    assert.equal(result.eligibilityDetails.cgpa.passed, true)
    assert.equal(result.eligibilityDetails.branch.passed, true)
    assert.equal(result.eligibilityDetails.graduationYear.passed, true)
    assert.equal(result.eligibilityDetails.backlogs.passed, true)
  })

  test('high relevance but ineligible due to branch', () => {
    const student = craftStudent({
      branch: 'Electronics and Communication Engineering',
      skills: ['React', 'JavaScript', 'CSS', 'Git'],
      preferredRoles: ['Frontend Developer'],
      preferredDomains: ['Web Development'],
      preferredLocations: ['Bengaluru'],
      preferredOpportunityTypes: ['Internship'],
    })

    const result = matchStudentToOpportunity(student, cloudSphere)

    assert.equal(result.matchScore, 100)
    assert.equal(result.relevant, true)
    assert.equal(result.eligible, false)
    assert.equal(result.eligibilityDetails.branch.passed, false)
    assert.ok(result.eligibilityDetails.branch.reason.includes('not in the allowed branches'))
  })

  test('low skill match produces low score', () => {
    const result = matchStudentToOpportunity(vikram, dataForge)

    assert.equal(result.matchingDetails.skills.percentage, 33.3)
    assert.equal(result.matchScore, 46.7)
    assert.equal(result.relevant, false)
  })

  test('no matching skills', () => {
    const result = matchStudentToOpportunity(vikram, techNova)

    assert.equal(result.matchingDetails.skills.percentage, 0)
    assert.deepEqual(result.matchingDetails.skills.matched, [])
    assert.equal(result.matchingDetails.skills.missing.length, 5)
  })

  test('preferred role/domain match', () => {
    const student = craftStudent({
      preferredRoles: ['Frontend Developer'],
      preferredDomains: [],
    })

    const result = matchStudentToOpportunity(student, cloudSphere)

    assert.equal(result.matchingDetails.roleDomain.matched, true)
  })

  test('location mismatch', () => {
    const student = craftStudent({
      skills: ['React', 'JavaScript', 'CSS', 'Git'],
      preferredLocations: ['Mumbai', 'Pune'],
    })

    const result = matchStudentToOpportunity(student, cloudSphere)

    assert.equal(result.matchingDetails.location.matched, false)
  })

  test('opportunity type mismatch', () => {
    const student = craftStudent({
      skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Git'],
      preferredOpportunityTypes: ['Internship'],
    })

    const result = matchStudentToOpportunity(student, techNova)

    assert.equal(result.matchingDetails.opportunityType.matched, false)
  })

  test('remote opportunity matches regardless of location preference', () => {
    const student = craftStudent({
      skills: ['Python', 'SQL'],
      preferredLocations: ['Mumbai'],
    })

    const result = matchStudentToOpportunity(student, dataForge)

    assert.equal(result.matchingDetails.location.matched, true)
  })

  test('CGPA eligibility failure', () => {
    const student = craftStudent({ cgpa: 6.9 })

    const result = matchStudentToOpportunity(student, dataForge)

    assert.equal(result.eligibilityDetails.cgpa.passed, false)
    assert.ok(result.eligibilityDetails.cgpa.reason.includes('below the minimum'))
  })

  test('graduation year eligibility failure', () => {
    const student = craftStudent({
      graduationYear: 2028,
      skills: ['React', 'JavaScript', 'CSS', 'Git'],
      preferredRoles: ['Frontend Developer'],
      preferredLocations: ['Bengaluru'],
    })

    const result = matchStudentToOpportunity(student, cloudSphere)

    assert.equal(result.eligibilityDetails.graduationYear.passed, false)
    assert.ok(result.eligibilityDetails.graduationYear.reason.includes('not in the allowed years'))
  })

  test('backlog eligibility failure', () => {
    const student = craftStudent({
      activeBacklogs: 2,
      skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Git'],
      preferredRoles: ['Software Engineer'],
      preferredLocations: ['Mumbai'],
      preferredOpportunityTypes: ['Full-time'],
    })

    const result = matchStudentToOpportunity(student, techNova)

    assert.equal(result.eligibilityDetails.backlogs.passed, false)
    assert.ok(result.eligibilityDetails.backlogs.reason.includes('exceed the limit'))
  })

  test('empty preferences count as satisfied', () => {
    const student = craftStudent()

    const result = matchStudentToOpportunity(student, cloudSphere)

    assert.equal(result.matchingDetails.roleDomain.matched, true)
    assert.equal(result.matchingDetails.location.matched, true)
    assert.equal(result.matchingDetails.opportunityType.matched, true)
  })

  test('skill matching is case-insensitive and deduplicates', () => {
    const student = craftStudent({
      skills: ['REACT', 'react', 'JavaScript', 'GIT'],
    })
    const opportunity = {
      ...cloudSphere,
      requiredSkills: ['React', 'javascript', 'Git', 'Git'],
    }

    const result = matchStudentToOpportunity(student, opportunity)

    assert.deepEqual(result.matchingDetails.skills.matched, ['react', 'javascript', 'git'])
    assert.equal(result.matchingDetails.skills.percentage, 100)
  })

  test('missing optional eligibility criteria pass without restriction', () => {
    const student = craftStudent({
      skills: ['React', 'JavaScript', 'CSS', 'Git'],
      preferredRoles: ['Frontend Developer'],
      preferredLocations: ['Bengaluru'],
    })
    const opportunity = {
      ...cloudSphere,
      minimumCgpa: undefined,
      allowedBranches: undefined,
      graduationYears: undefined,
      maximumActiveBacklogs: undefined,
    }

    const result = matchStudentToOpportunity(student, opportunity)

    assert.equal(result.eligibilityDetails.cgpa.passed, true)
    assert.equal(result.eligibilityDetails.branch.passed, true)
    assert.equal(result.eligibilityDetails.graduationYear.passed, true)
    assert.equal(result.eligibilityDetails.backlogs.passed, true)
  })

  test('score is bounded between 0 and 100 for all matches', () => {
    for (const student of students) {
      for (const opportunity of opportunities) {
        const result = matchStudentToOpportunity(student, opportunity)
        assert.ok(result.matchScore >= 0, `${student.id}/${opportunity.id} below 0`)
        assert.ok(result.matchScore <= 100, `${student.id}/${opportunity.id} above 100`)
      }
    }
  })

  test('weights sum to 100 and threshold is sensible', () => {
    const total = MATCH_WEIGHTS.skills + MATCH_WEIGHTS.roleDomain + MATCH_WEIGHTS.location + MATCH_WEIGHTS.opportunityType
    assert.equal(total, 100)
    assert.ok(RELEVANCE_THRESHOLD > 0 && RELEVANCE_THRESHOLD <= 100)
  })
})

describe('getStudentMatches', () => {
  test('sorts results by matchScore descending', () => {
    const results = getStudentMatches(ananya)

    for (let i = 1; i < results.length; i += 1) {
      assert.ok(results[i - 1].matchScore >= results[i].matchScore)
    }
  })

  test('matches every known opportunity', () => {
    const results = getStudentMatches(vikram)
    assert.equal(results.length, opportunities.length)
  })
})