import * as studentService from '../services/studentService.js'
import * as opportunityService from '../services/opportunityService.js'
import * as matchingService from '../services/matchingService.js'

const studentErrorResponse = (result) => ({
  code: result.status === 404 ? 'STUDENT_NOT_FOUND' : 'INVALID_STUDENT_ID',
  message: result.message,
})

const opportunityErrorResponse = (result) => ({
  code: result.status === 404 ? 'OPPORTUNITY_NOT_FOUND' : 'INVALID_OPPORTUNITY_ID',
  message: result.message,
})

const attachOpportunity = (match) => ({
  ...match,
  opportunity: opportunityService.getOpportunityById(match.opportunityId).data,
})

export const getStudentMatches = (req, res) => {
  const { studentId } = req.params
  const studentResult = studentService.getStudentById(studentId)

  if (!studentResult.ok) {
    res.status(studentResult.status).json({
      success: false,
      error: studentErrorResponse(studentResult),
    })
    return
  }

  const data = matchingService.getStudentMatches(studentResult.data).map(attachOpportunity)

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  })
}

export const getStudentOpportunityMatch = (req, res) => {
  const { studentId, opportunityId } = req.params
  const studentResult = studentService.getStudentById(studentId)

  if (!studentResult.ok) {
    res.status(studentResult.status).json({
      success: false,
      error: studentErrorResponse(studentResult),
    })
    return
  }

  const opportunityResult = opportunityService.getOpportunityById(opportunityId)

  if (!opportunityResult.ok) {
    res.status(opportunityResult.status).json({
      success: false,
      error: opportunityErrorResponse(opportunityResult),
    })
    return
  }

  const data = {
    ...matchingService.matchStudentToOpportunity(
      studentResult.data,
      opportunityResult.data,
    ),
    opportunity: opportunityResult.data,
  }

  res.status(200).json({
    success: true,
    data,
  })
}