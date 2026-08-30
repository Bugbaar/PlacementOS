import * as opportunityService from '../services/opportunityService.js'
import * as notificationService from '../services/notificationService.js'

export const getOpportunities = (req, res) => {
  const opportunities = opportunityService.getAllOpportunities()

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities,
  })
}

export const getOpportunityById = (req, res) => {
  const { id } = req.params
  const result = opportunityService.getOpportunityById(id)

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
    data: result.data,
  })
}

export const createOpportunity = (req, res) => {
  const result = opportunityService.createOpportunity(req.body)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: 'INVALID_OPPORTUNITY_DATA',
        message: result.message,
        errors: result.errors,
      },
    })
    return
  }

  const sendNotifications = () => {
    try {
      notificationService.createNotificationsForOpportunity(result.data)
    } catch (error) {
      console.error('Failed to generate notifications:', error)
    }
  }

  setImmediate(sendNotifications)

  res.status(201).json({
    success: true,
    message: 'Opportunity created successfully',
    data: result.data,
  })
}