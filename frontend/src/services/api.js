import { API_BASE_URL } from '../config'

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = body?.error?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return body
}