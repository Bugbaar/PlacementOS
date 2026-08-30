import { Router } from 'express'

import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
} from '../controllers/opportunityController.js'

const router = Router()

router.get('/', getOpportunities)
router.get('/:id', getOpportunityById)
router.post('/', createOpportunity)

export default router