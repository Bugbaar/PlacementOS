# REST API Documentation

All API responses follow a standard format:
```json
{
  "success": true,
  "data": { ... }
}
```

## Students

### `POST /api/students`
Create a new student profile.

### `GET /api/students`
Get all students (for demo purposes).

### `GET /api/students/:id`
Get a specific student profile.

### `PUT /api/students/:id`
Update a student profile.

## Opportunities

### `POST /api/opportunities`
Create a new opportunity.

### `GET /api/opportunities`
Get all active opportunities.

### `GET /api/opportunities/:id`
Get a specific opportunity.

### `PUT /api/opportunities/:id`
Update an opportunity.

### `DELETE /api/opportunities/:id`
Delete an opportunity.

## Recommendations

### `GET /api/recommendations/:studentId`
Get personalized opportunity recommendations for a student.
**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10)
- `minScore`: Minimum match score (default 0)

## Applications

### `POST /api/applications`
Apply to or save an opportunity.

### `GET /api/applications/student/:studentId`
Get all applications for a student.

### `PUT /api/applications/:id`
Update application status (e.g., from 'saved' to 'applied').

## AI Assistant

### `GET /api/ai/advice/:studentId`
Get personalized career advice based on the student's profile.

### `GET /api/ai/explanation/:studentId/:opportunityId`
Get an explainable breakdown of why a student matches a specific opportunity.

### `GET /api/ai/skills/:studentId`
Get skill recommendations to improve placement readiness.
