import { Router } from 'express'

import {
  getStudents,
  getStudentById,
  updateStudentById,
} from '../controllers/studentController.js'

const router = Router()

router.get('/', getStudents)
router.get('/:id', getStudentById)
router.patch('/:id', updateStudentById)

export default router