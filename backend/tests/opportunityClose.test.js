import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import * as applicationService from '../src/services/applicationService.js'
import * as opportunityService from '../src/services/opportunityService.js'
import * as matchingService from '../src/services/matchingService.js'
import { opportunities } from '../src/data/opportunities.js'
import { applications, resetApplications } from '../src/data/applications.js'
import { students } from '../src/data/students.js'

const alex = students.find((student) => student.id === 'student_005')

const craftOpportunity = (overrides = {}) => ({
  id: 'opportunity_500',
  company: 'CloseCo',
  role: 'Frontend Engineer',
  domain: 'Web Development',
  description: 'A crafted opportunity for close-flow tests.',
  opportunityType: 'Internship',
  locations: ['Remote'],
  workMode: 'Remote',
  requiredSkills: ['JavaScript', 'React'],
  deadline: '2030-01-01',
  minimumCgpa: 0,
  allowedBranches: [],
  graduationYears: [],
  maximumActiveBacklogs: 99,
  ...overrides,
})

describe('opportunityService.closeOpportunity', () => {
  beforeEach(() => {
    resetApplications()
  })

  test('closes an open opportunity', () => {
    opportunities.push(craftOpportunity({ id: 'opportunity_500' }))
    try {
      const result = opportunityService.closeOpportunity('opportunity_500')
      assert.equal(result.ok, true)
      assert.equal(result.data.closed, true)
    } finally {
      const index = opportunities.findIndex((o) => o.id === 'opportunity_500')
      if (index !== -1) opportunities.splice(index, 1)
    }
  })

  test('returns 404 for an unknown opportunity', () => {
    const result = opportunityService.closeOpportunity('opportunity_999')
    assert.equal(result.ok, false)
    assert.equal(result.status, 404)
  })

  test('rejects closing an already closed opportunity', () => {
    opportunities.push(craftOpportunity({ id: 'opportunity_501', closed: true }))
    try {
      const result = opportunityService.closeOpportunity('opportunity_501')
      assert.equal(result.ok, false)
      assert.equal(result.status, 409)
    } finally {
      const index = opportunities.findIndex((o) => o.id === 'opportunity_501')
      if (index !== -1) opportunities.splice(index, 1)
    }
  })
})

describe('applicationService.applyToOpportunity on closed opportunity', () => {
  beforeEach(() => {
    resetApplications()
  })

  test('rejects an application to a closed opportunity with OPPORTUNITY_CLOSED', () => {
    opportunities.push(craftOpportunity({ id: 'opportunity_502' }))
    try {
      opportunityService.closeOpportunity('opportunity_502')

      const result = applicationService.applyToOpportunity(alex.id, 'opportunity_502')

      assert.equal(result.ok, false)
      assert.equal(result.code, 'OPPORTUNITY_CLOSED')
      assert.equal(result.status, 403)
      assert.equal(applications.length, 0)
    } finally {
      const index = opportunities.findIndex((o) => o.id === 'opportunity_502')
      if (index !== -1) opportunities.splice(index, 1)
    }
  })
})

describe('matchingService.getStudentMatches excludes closed opportunities', () => {
  test('does not return closed opportunities', () => {
    opportunities.push(craftOpportunity({ id: 'opportunity_503', closed: true }))
    try {
      const matches = matchingService.getStudentMatches(alex)
      const ids = matches.map((match) => match.opportunityId)
      assert.ok(!ids.includes('opportunity_503'))
    } finally {
      const index = opportunities.findIndex((o) => o.id === 'opportunity_503')
      if (index !== -1) opportunities.splice(index, 1)
    }
  })
})
