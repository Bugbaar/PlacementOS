# PlacementOS API Documentation

Base URL: `http://localhost:5000/api/v1`

Authentication: Bearer token in `Authorization` header (except auth routes)

---

## Health & Monitoring

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Basic health check |
| GET | `/health/detailed` | No | Detailed service status |
| GET | `/metrics` | No | Server metrics |

---

## Authentication

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/auth/register` | No | - | Register new user |
| POST | `/auth/login` | No | - | Login user |
| GET | `/auth/me` | Yes | Any | Get current user profile |
| POST | `/auth/refresh` | No | - | Refresh JWT token |

---

## Students

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/students/profile` | Yes | STUDENT | Get student profile |
| PUT | `/students/profile` | Yes | STUDENT | Update student profile |
| GET | `/students/dashboard/stats` | Yes | STUDENT | Get dashboard statistics |
| GET | `/students/` | Yes | PLACEMENT_CELL, RECRUITER, ADMIN | List all students |
| GET | `/students/:id` | Yes | Any | Get student by ID |

---

## Companies

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/companies/my-company` | Yes | RECRUITER | Get recruiter's company |
| POST | `/companies/` | Yes | RECRUITER, ADMIN | Create company |
| GET | `/companies/` | Yes | Any | List all companies |
| GET | `/companies/:id` | Yes | Any | Get company by ID |
| PUT | `/companies/:id` | Yes | RECRUITER, ADMIN | Update company |
| DELETE | `/companies/:id` | Yes | RECRUITER, ADMIN | Delete company |

---

## Jobs

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/jobs/` | Yes | RECRUITER | Create job posting |
| GET | `/jobs/` | Yes | Any | List all jobs (with filters) |
| GET | `/jobs/my-jobs` | Yes | RECRUITER | Get recruiter's jobs |
| GET | `/jobs/:id` | Yes | Any | Get job by ID |
| PUT | `/jobs/:id` | Yes | RECRUITER, PLACEMENT_CELL | Update job |
| DELETE | `/jobs/:id` | Yes | RECRUITER, PLACEMENT_CELL | Delete job |
| POST | `/jobs/:id/apply` | Yes | STUDENT | Apply to job |

---

## Applications

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/applications/` | Yes | STUDENT, RECRUITER, PLACEMENT_CELL, ADMIN | List applications |
| PUT | `/applications/:id/status` | Yes | RECRUITER, PLACEMENT_CELL, ADMIN | Update application status |
| GET | `/applications/job/:jobId` | Yes | RECRUITER, PLACEMENT_CELL, ADMIN | Get applications by job |

---

## Drives

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/drives/` | Yes | PLACEMENT_CELL, ADMIN | Create placement drive |
| GET | `/drives/` | Yes | Any | List all drives |
| GET | `/drives/:id` | Yes | Any | Get drive by ID |
| POST | `/drives/:id/register` | Yes | STUDENT | Register for drive |
| PUT | `/drives/:id` | Yes | PLACEMENT_CELL, ADMIN | Update drive |
| DELETE | `/drives/:id` | Yes | PLACEMENT_CELL, ADMIN | Delete drive |

---

## Resume Analysis

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/resume/analyze` | Yes | STUDENT | Upload and analyze resume (multipart: resumeFile) |
| GET | `/resume/history` | Yes | STUDENT | Get resume analysis history |
| GET | `/resume/:id` | Yes | Any | Get resume by ID |

---

## AI Services

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/ai/chat` | Yes | Any | AI chat assistant |
| POST | `/ai/interview-prep` | Yes | Any | Generate mock interview questions |
| GET | `/ai/readiness-score` | Yes | STUDENT | Get placement readiness score |
| GET | `/ai/recommended-jobs` | Yes | STUDENT | Get recommended jobs |

---

## Analytics

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/analytics/overview` | Yes | PLACEMENT_CELL, ADMIN | Get placement overview |
| GET | `/analytics/branch-distribution` | Yes | PLACEMENT_CELL, ADMIN | Get branch-wise statistics |
| GET | `/analytics/salary-metrics` | Yes | PLACEMENT_CELL, ADMIN | Get salary analytics |

---

## Announcements

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/announcements/` | Yes | PLACEMENT_CELL, ADMIN | Create announcement |
| GET | `/announcements/` | Yes | Any | List announcements |
| DELETE | `/announcements/:id` | Yes | PLACEMENT_CELL, ADMIN | Delete announcement |

---

## Notifications

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/notifications/` | Yes | Any | List user notifications |
| PUT | `/notifications/read-all` | Yes | Any | Mark all as read |
| PUT | `/notifications/:id/read` | Yes | Any | Mark notification as read |

---

## External Jobs

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/external-jobs/` | Yes | Any | Search external jobs |
| GET | `/external-jobs/:id` | Yes | Any | Get external job by ID |
| POST | `/external-jobs/import/linkedin` | Yes | ADMIN, PLACEMENT_CELL | Import from LinkedIn |
| POST | `/external-jobs/import/indeed` | Yes | ADMIN, PLACEMENT_CELL | Import from Indeed |
| POST | `/external-jobs/sync` | Yes | ADMIN | Sync external jobs |

---

## Parent/Advisor

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/parent/profile` | Yes | PARENT_ADVISOR | Get parent profile |
| GET | `/parent/dashboard` | Yes | PARENT_ADVISOR | Get parent dashboard |
| GET | `/parent/stats` | Yes | PARENT_ADVISOR | Get dashboard statistics |
| POST | `/parent/link-student` | Yes | PARENT_ADVISOR | Link student to parent |
| DELETE | `/parent/unlink-student/:studentId` | Yes | PARENT_ADVISOR | Unlink student |
| GET | `/parent/student/:studentId/progress` | Yes | PARENT_ADVISOR | Get student progress |

---

## Recommendations

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/recommendations/collaborative` | Yes | STUDENT | Get collaborative filtering recommendations |
| GET | `/recommendations/trending` | Yes | Any | Get trending jobs |

---

## Reviews

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/reviews/` | Yes | Any | Add company review |
| GET | `/reviews/company/:companyId` | Yes | Any | Get company reviews |
| GET | `/reviews/company/:companyId/sentiment` | Yes | Any | Get sentiment summary |

---

## Plagiarism Check

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/plagiarism/check` | Yes | STUDENT | Check document for plagiarism |
| GET | `/plagiarism/stats` | Yes | STUDENT | Get plagiarism check statistics |

---

## Roles

- `STUDENT` - Job applicant
- `RECRUITER` - Company recruiter
- `PLACEMENT_CELL` - College placement officer
- `ADMIN` - System administrator
- `PARENT_ADVISOR` - Parent or advisor

---

## Response Format

Success:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "Success message"
}
```

Error:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Error type",
  "message": "Error description"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
