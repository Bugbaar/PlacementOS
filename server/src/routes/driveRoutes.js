import express from 'express';
import {
  createDrive,
  listDrives,
  getDriveById,
  registerForDrive,
  updateDrive,
  deleteDrive,
} from '../controllers/driveController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, driveCreateSchema } from '../utils/validator.js';

const router = express.Router();

router.post('/', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), validateBody(driveCreateSchema), createDrive);
router.get('/', authenticate, listDrives);
router.get('/:id', authenticate, getDriveById);
router.post('/:id/register', authenticate, authorize('STUDENT'), registerForDrive);
router.put('/:id', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), updateDrive);
router.delete('/:id', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), deleteDrive);

export default router;
