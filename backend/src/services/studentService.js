import { students } from '../data/students.js'

const STUDENT_ID_PATTERN = /^student_\d{3,}$/

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