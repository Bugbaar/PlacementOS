import { Router } from 'express';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent
} from '../controllers/studentController';

const router = Router();

router.route('/').post(createStudent).get(getStudents);
router.route('/:id').get(getStudentById).patch(updateStudent).delete(deleteStudent);

export default router;
