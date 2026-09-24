# REST API Documentation

All API responses follow a standard format:
```json
{
  "success": true,
  "data": { ... }
}
```

Protected routes require `Authorization: Bearer <jwt>`.

## Auth

### `POST /api/auth/register`
Register a new student account (public). Returns `{ token, student }`.

### `POST /api/auth/login`
Login with email/password (public). Returns `{ token, student }`.

### `GET /api/auth/me`
Return the authenticated student profile (auth required).

## Students

### `POST /api/students`
Create a student account (admin only). Body includes `password`.

### `GET /api/students`
List all students — exposes PII (admin only).

### `GET /api/students/:id`
Get a specific student profile (self or admin).

### `PUT /api/students/:id`
Update a student profile (self or admin).

## Opportunities

### `POST /api/opportunities`
Create a new opportunity (admin only).

### `GET /api/opportunities`
Get all active opportunities (public, no student PII).

### `GET /api/opportunities/:id`
Get a specific opportunity (public).

### `PUT /api/opportunities/:id`
Update an opportunity (admin only).

### `DELETE /api/opportunities/:id`
Delete an opportunity (admin only).

## Recommendations

### `GET /api/recommendations/:studentId`
Get personalized opportunity recommendations for a student (self or admin).
**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10)
- `minScore`: Minimum match score (default 0)

## Applications

### `POST /api/applications`
Apply to or save an opportunity (auth; own `studentId` only).

### `GET /api/applications/student/:studentId`
Get all applications for a student (self or admin).

### `PUT /api/applications/:id`
Update application status (own application or admin).

## AI Assistant

### `POST /api/assistant/chat`
Chat with the Groq-powered placement assistant (auth; body `studentId` must match the caller unless admin).
