import { students } from '../data/students.js'

const STUDENT_ID_PATTERN = /^student_\d{3,}$/
const OPPORTUNITY_TYPE_OPTIONS = ['Internship', 'Full-time']

export const getAllStudents = () => students

export const getStudentById = (id) => {
  if (!STUDENT_ID_PATTERN.test(id)) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid student ID format',
    }
  }

  const student = students.find((entry) => entry.id === id)

  if (!student) {
    return {
      ok: false,
      status: 404,
      message: 'Student not found',
    }
  }

  return { ok: true, data: student }
}

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0

const isStringArray = (value) =>
  Array.isArray(value) && value.every(isNonEmptyString)

const isNonNegativeInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0

const normalizeList = (value) =>
  isStringArray(value) ? value.map((entry) => entry.trim()) : undefined

export const updateStudent = (id, payload) => {
  const errors = []
  const studentResult = getStudentById(id)

  if (!studentResult.ok) {
    return studentResult
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      ok: false,
      status: 400,
      message: 'Request body must be a JSON object',
    }
  }

  const { name, email, branch, cgpa, graduationYear, activeBacklogs } = payload

  if (name !== undefined && !isNonEmptyString(name)) {
    errors.push('name must be a non-empty string')
  }
  if (email !== undefined && !isNonEmptyString(email)) {
    errors.push('email must be a non-empty string')
  }
  if (branch !== undefined && !isNonEmptyString(branch)) {
    errors.push('branch must be a non-empty string')
  }
  if (cgpa !== undefined) {
    const parsed = Number(cgpa)
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 10) {
      errors.push('cgpa must be a number between 0 and 10')
    }
  }
  if (graduationYear !== undefined && !isNonNegativeInteger(graduationYear)) {
    errors.push('graduationYear must be a non-negative integer')
  }
  if (activeBacklogs !== undefined && !isNonNegativeInteger(activeBacklogs)) {
    errors.push('activeBacklogs must be a non-negative integer')
  }

  if (payload.skills !== undefined && !isStringArray(payload.skills)) {
    errors.push('skills must be an array of non-empty strings')
  }
  if (payload.preferredRoles !== undefined && !isStringArray(payload.preferredRoles)) {
    errors.push('preferredRoles must be an array of non-empty strings')
  }
  if (payload.preferredDomains !== undefined && !isStringArray(payload.preferredDomains)) {
    errors.push('preferredDomains must be an array of non-empty strings')
  }
  if (payload.preferredLocations !== undefined && !isStringArray(payload.preferredLocations)) {
    errors.push('preferredLocations must be an array of non-empty strings')
  }
  if (payload.preferredOpportunityTypes !== undefined) {
    if (
      !isStringArray(payload.preferredOpportunityTypes) ||
      !payload.preferredOpportunityTypes.every((type) =>
        OPPORTUNITY_TYPE_OPTIONS.includes(type),
      )
    ) {
      errors.push(
        'preferredOpportunityTypes must be an array chosen from: Internship, Full-time',
      )
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      status: 400,
      message: errors[0],
      errors,
    }
  }

  const student = studentResult.data

  student.name = name !== undefined ? name.trim() : student.name
  student.email = email !== undefined ? email.trim() : student.email
  student.branch = branch !== undefined ? branch.trim() : student.branch
  student.cgpa =
    cgpa !== undefined ? Number(cgpa) : student.cgpa
  student.graduationYear =
    graduationYear !== undefined ? Number(graduationYear) : student.graduationYear
  student.activeBacklogs =
    activeBacklogs !== undefined ? Number(activeBacklogs) : student.activeBacklogs
  student.skills = payload.skills !== undefined ? normalizeList(payload.skills) : student.skills
  student.preferredRoles =
    payload.preferredRoles !== undefined ? normalizeList(payload.preferredRoles) : student.preferredRoles
  student.preferredDomains =
    payload.preferredDomains !== undefined ? normalizeList(payload.preferredDomains) : student.preferredDomains
  student.preferredLocations =
    payload.preferredLocations !== undefined ? normalizeList(payload.preferredLocations) : student.preferredLocations
  student.preferredOpportunityTypes =
    payload.preferredOpportunityTypes !== undefined
      ? normalizeList(payload.preferredOpportunityTypes)
      : student.preferredOpportunityTypes

  return { ok: true, data: student }
}