import { request } from './api'

export function applyToOpportunity(opportunityId, studentId) {
  return request(`/opportunities/${opportunityId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  })
}

export function fetchStudentApplications(studentId) {
  return request(`/students/${studentId}/applications`)
}
