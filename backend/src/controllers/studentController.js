import * as studentService from '../services/studentService.js'

export const getStudents = (req, res) => {
  const students = studentService.getAllStudents()

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  })
}

export const getStudentById = (req, res) => {
  const { id } = req.params
  const result = studentService.getStudentById(id)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: result.status === 404 ? 'STUDENT_NOT_FOUND' : 'INVALID_STUDENT_ID',
        message: result.message,
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    data: result.data,
  })
}

export const updateStudentById = (req, res) => {
  const { id } = req.params
  const result = studentService.updateStudent(id, req.body)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: result.status === 404 ? 'STUDENT_NOT_FOUND' : 'INVALID_STUDENT_PROFILE',
        message: result.message,
        errors: result.errors,
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    message: 'Student profile updated successfully',
    data: result.data,
  })
}