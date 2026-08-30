export function formatRelativeTime(timestamp) {
  const date = new Date(timestamp)
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffSeconds < 60) {
    return 'Just now'
  }

  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}d ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}