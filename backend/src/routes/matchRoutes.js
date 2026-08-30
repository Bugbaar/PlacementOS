import { Router } from 'express'

import {
  getStudentMatches,
  getStudentOpportunityMatch,
} from '../controllers/matchController.js'

const router = Router()

router.get('/:studentId/opportunities/matches', getStudentMatches)
router.get('/:studentId/opportunities/:opportunityId/match', getStudentOpportunityMatch)

export default router