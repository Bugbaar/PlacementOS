import * as notificationService from '../services/notificationService.js'

export const getNotificationsForStudent = (req, res) => {
  const { studentId } = req.params
  const result = notificationService.getNotificationsForStudent(studentId)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: result.status === 404 ? 'STUDENT_NOT_FOUND' : 'INVALID_STUDENT_ID',
        message: result.message,
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    count: result.data.length,
    unreadCount: result.unreadCount,
    data: result.data,
  })
}

export const markNotificationAsRead = (req, res) => {
  const { notificationId } = req.params
  const result = notificationService.markNotificationAsRead(notificationId)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code:
          result.status === 404 ? 'NOTIFICATION_NOT_FOUND' : 'INVALID_NOTIFICATION_ID',
        message: result.message,
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    data: result.data,
  })
}

export const markAllNotificationsAsRead = (req, res) => {
  const { studentId } = req.params
  const result = notificationService.markAllNotificationsAsReadForStudent(studentId)

  if (!result.ok) {
    res.status(result.status).json({
      success: false,
      error: {
        code: result.status === 404 ? 'STUDENT_NOT_FOUND' : 'INVALID_STUDENT_ID',
        message: result.message,
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    markedRead: result.count,
  })
}