import { Router } from 'express'

import { getStudents, getStudentById } from '../controllers/studentController.js'

const router = Router()

router.get('/', getStudents)
router.get('/:id', getStudentById)

export default router