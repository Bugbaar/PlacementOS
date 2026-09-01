import express from 'express';
import {
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, announcementCreateSchema } from '../utils/validator.js';

const router = express.Router();

router.post('/', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), validateBody(announcementCreateSchema), createAnnouncement);
router.get('/', authenticate, listAnnouncements);
router.delete('/:id', authenticate, authorize('PLACEMENT_CELL', 'ADMIN'), deleteAnnouncement);

export default router;
