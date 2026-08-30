import { request } from './api'

export function fetchStudentMatches(studentId) {
  return request(`/students/${studentId}/opportunities/matches`)
}