import { Router } from 'express'

import {
  getOpportunities,
  getOpportunityById,
  getOpportunityAnalytics,
  createOpportunity,
  closeOpportunityById,
} from '../controllers/opportunityController.js'
import { applyToOpportunity, getApplicationsForOpportunity } from '../controllers/applicationController.js'

const router = Router()

router.get('/', getOpportunities)
router.get('/:id/analytics', getOpportunityAnalytics)
router.get('/:id/applications', getApplicationsForOpportunity)
router.get('/:id', getOpportunityById)
router.post('/', createOpportunity)
router.patch('/:id/close', closeOpportunityById)
router.post('/:id/apply', applyToOpportunity)

export default router