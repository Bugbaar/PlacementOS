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

## Resume versions

Base: `/api/students/:studentId/resumes` (self or admin). **In-memory MVP** (not persisted).

### `GET /api/students/:studentId/resumes`
List resume versions for the student.

### `POST /api/students/:studentId/resumes`
Create a version. Body: `{ "name": string, "fileUrl": string }`.

### `GET /api/students/:studentId/resumes/:versionId`
Get one version.

### `POST /api/students/:studentId/resumes/:versionId/activate`
Mark this version active (others become inactive).

### `DELETE /api/students/:studentId/resumes/:versionId`
Delete an inactive version (active cannot be deleted).

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

## Resume–JD Fit

### `POST /api/resume-fit`
Analyze resume vs job description (multipart, **auth required**). Fields:
- `resume` — PDF file (required, max 5MB)
- `jobDescription` — string (required, min 20 chars)

Returns match percentage, matched/missing skills, and top relevant bullets.

LLM extraction (optional): first available of `GROQ_API_KEY` → `OPENAI_API_KEY` → `ANTHROPIC_API_KEY` → `GEMINI_API_KEY`, or force with `RESUME_FIT_PROVIDER` (`groq` | `openai` | `anthropic` | `gemini` | `heuristic`). Models via `GROQ_MODEL` / `OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GEMINI_MODEL`. Offline heuristic if no key. Bullet embeddings use Gemini when `GEMINI_API_KEY` is set, else hashing. Persistence only when Mongo is connected.

## Placement Cell Shortlist (admin)

Auth: JWT + **admin** role.

### `POST /api/shortlist/upload`
Multipart CSV (`file`). Returns `batchId`, count, preview, branches, skill universe.

### `POST /api/shortlist/run`
Body: `{ batchId, criteria }`. Runs eligibility engine; returns metrics, logs, results, mock notifications.

### `GET /api/shortlist/runs/:id`
### `GET /api/shortlist/runs/:id/export.csv?mode=shortlisted|audit`
### `GET /api/shortlist/runs/:id/export.pdf`
### `GET /api/shortlist/notifications?runId=`
