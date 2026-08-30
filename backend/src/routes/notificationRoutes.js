import { Router } from 'express'

import {
  getNotificationsForStudent,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js'

const router = Router()

router.get('/students/:studentId/notifications', getNotificationsForStudent)
router.patch('/notifications/:notificationId/read', markNotificationAsRead)
router.patch('/students/:studentId/notifications/read-all', markAllNotificationsAsRead)

export default router