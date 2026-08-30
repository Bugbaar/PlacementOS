import { useCallback, useEffect, useRef, useState } from 'react'
import * as notificationService from '../services/notificationService'
import { CURRENT_STUDENT_ID } from '../config'
import { formatRelativeTime } from '../utils/format'

function BellIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  )
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const containerRef = useRef(null)

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const loadNotifications = useCallback(() => {
    return notificationService.fetchNotifications(CURRENT_STUDENT_ID)
  }, [])

  const applyNotifications = useCallback((body) => {
    setNotifications(body.data)
    setError(null)
    setLoading(false)
  }, [])

  const failNotifications = useCallback((requestError) => {
    setError(requestError.message)
    setLoading(false)
  }, [])

  const refresh = useCallback(() => {
    loadNotifications().then(applyNotifications).catch(failNotifications)
  }, [loadNotifications, applyNotifications, failNotifications])

  useEffect(() => {
    let cancelled = false

    loadNotifications()
      .then((body) => {
        if (!cancelled) {
          applyNotifications(body)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          failNotifications(requestError)
        }
      })

    return () => {
      cancelled = true
    }
  }, [loadNotifications, applyNotifications, failNotifications])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    refresh()
  }

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = () => {
    setOpen((current) => {
      const next = !current
      if (next) {
        refresh()
      }
      return next
    })
  }

  const handleMarkRead = async (notification) => {
    if (notification.read) {
      return
    }

    setNotifications((current) =>
      current.map((entry) =>
        entry.id === notification.id ? { ...entry, read: true } : entry,
      ),
    )

    try {
      await notificationService.markNotificationAsRead(notification.id)
    } catch {
      refresh()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead(CURRENT_STUDENT_ID)
      setNotifications((current) =>
        current.map((entry) => ({ ...entry, read: true })),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200 transition hover:text-gray-900 hover:ring-gray-300"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                Loading notifications…
              </div>
            ) : error ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-gray-600">
                  Could not load notifications.
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-gray-50 ${
                        notification.read ? 'opacity-70' : ''
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}
                          {notification.title}
                        </span>
                        {notification.matchScore !== undefined && (
                          <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                            {notification.matchScore}%
                          </span>
                        )}
                      </span>
                      <span className="text-xs leading-relaxed text-gray-600">
                        {notification.message}
                      </span>
                      <span className="mt-0.5 flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {notification.opportunity
                            ? notification.opportunity.company
                            : 'Opportunity'}
                        </span>
                        <time dateTime={notification.createdAt}>
                          {formatRelativeTime(notification.createdAt)}
                        </time>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell