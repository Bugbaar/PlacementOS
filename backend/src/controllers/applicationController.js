import * as applicationService from '../services/applicationService.js'

export const applyToOpportunity = (req, res) => {
  const { id: opportunityId } = req.params
  const { studentId } = req.body ?? {}

  if (!studentId || typeof studentId !== 'string') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_APPLICATION',
        message: 'studentId is required',
      },
    })
    return
  }

  const result = applicationService.applyToOpportunity(studentId, opportunityId)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: result.code,
        message: result.message,
      },
    })
    return
  }

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: result.data,
  })
}

export const getApplicationsForOpportunity = (req, res) => {
  const { id: opportunityId } = req.params
  const result = applicationService.getApplicationsForOpportunity(opportunityId)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: result.status === 404 ? 'OPPORTUNITY_NOT_FOUND' : 'INVALID_OPPORTUNITY_ID',
        message: result.message,
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
  })
}
