import { Router } from 'express';
import { createStudent, getStudent, updateStudent, getStudents } from '../controllers/studentController';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../validators/studentValidator';

const router = Router();

router.post('/', validate(createStudentSchema), createStudent);
router.get('/', getStudents);
router.get('/:id', getStudent);
router.put('/:id', validate(updateStudentSchema), updateStudent);

export default router;
