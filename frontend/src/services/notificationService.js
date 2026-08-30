import { request } from './api'

export function fetchNotifications(studentId) {
  return request(`/students/${studentId}/notifications`)
}

export function markNotificationAsRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: 'PATCH' })
}

export function markAllNotificationsAsRead(studentId) {
  return request(`/students/${studentId}/notifications/read-all`, { method: 'PATCH' })
}