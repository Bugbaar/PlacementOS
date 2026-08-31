import { request } from './api'

export function createOpportunity(payload) {
  return request('/opportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}