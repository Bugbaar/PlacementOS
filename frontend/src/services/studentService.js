import { request } from './api'

export function fetchStudentProfile(studentId) {
  return request(`/students/${studentId}`)
}

export function updateStudentProfile(studentId, payload) {
  return request(`/students/${studentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
