import { request } from './api'

export function createOpportunity(payload) {
  return request('/opportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function fetchOpportunities() {
  return request('/opportunities')
}

export function closeOpportunity(opportunityId) {
  return request(`/opportunities/${opportunityId}/close`, {
    method: 'PATCH',
  })
}

export function fetchOpportunityAnalytics(opportunityId) {
  return request(`/opportunities/${opportunityId}/analytics`)
}

export function fetchApplications(opportunityId) {
  return request(`/opportunities/${opportunityId}/applications`)
}
