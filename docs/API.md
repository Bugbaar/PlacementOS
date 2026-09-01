# PlacementOS — REST API Specification (v1)

**Base URL**: `http://localhost:5000/api/v1`

All responses follow the standard `ApiResponse` envelope:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success",
  "success": true
}
```

All errors follow the standard `ApiError` envelope:
```json
{
  "success": false,
  "error": "Error Name",
  "message": "Human readable error description",
  "details": []
}
```

---

## 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new student, recruiter, or placement officer (with Joi validation).
  - Body: `{ email, password, name, role }`
- `POST /api/v1/auth/login` — Authenticate user and receive JWT access token.
  - Body: `{ email, password }`
- `GET /api/v1/auth/me` — Fetch authenticated user profile and role details.
  - Headers: `Authorization: Bearer <token>`
- `POST /api/v1/auth/refresh` — Refresh access token using refresh token.

---

## 2. Students (`/api/v1/students`)
- `GET /api/v1/students/profile` — Get current logged-in student's full profile & application history.
- `PUT /api/v1/students/profile` — Update student credentials, CGPA, skills, branch, links.
- `GET /api/v1/students/dashboard/stats` — Get current student stats (applied, interviews, offers).
- `GET /api/v1/students` — (Recruiter / Placement Cell) List students with filters (`search`, `branch`, `minCgpa`, `skills`).
- `GET /api/v1/students/:id` — View specific student portfolio.

---

## 3. Companies (`/api/v1/companies`)
- `GET /api/v1/companies` — List all registered companies.
- `GET /api/v1/companies/my` — (Recruiter) Get company managed by authenticated recruiter.
- `POST /api/v1/companies` — (Recruiter) Create company profile.
- `PUT /api/v1/companies/:id` — Update company profile.
- `GET /api/v1/companies/:id` — View company details and active job postings.

---

## 4. Jobs (`/api/v1/jobs`)
- `GET /api/v1/jobs` — Browse & search job listings with query filters (`search`, `type`, `location`, `branch`).
- `GET /api/v1/jobs/:id` — Get single job details (includes `hasApplied` flag for students).
- `POST /api/v1/jobs` — (Recruiter / Placement Cell) Post new job opening with Joi schema validation.
- `PUT /api/v1/jobs/:id` — Update job posting.
- `DELETE /api/v1/jobs/:id` — Close/delete job posting.
- `POST /api/v1/jobs/:id/apply` — (Student) 1-Click apply with eligibility validation & optional cover letter.

---

## 5. Applications (`/api/v1/applications`)
- `GET /api/v1/applications` — Get user applications (Students see their applications; Recruiters see candidates).
- `GET /api/v1/applications/job/:jobId` — (Recruiter) Get all applications for a specific job.
- `PUT /api/v1/applications/:id/status` — (Recruiter / Placement Cell) Transition candidate status (`SHORTLISTED`, `INTERVIEW_SCHEDULED`, `OFFER_EXTENDED`, `SELECTED`, `REJECTED`).

---

## 6. Placement Drives (`/api/v1/drives`)
- `GET /api/v1/drives` — List campus recruitment drives.
- `GET /api/v1/drives/:id` — View drive details, rounds, and eligibility criteria.
- `POST /api/v1/drives` — (Placement Cell) Schedule new campus drive.
- `POST /api/v1/drives/:id/register` — (Student) 1-Click campus drive registration with automated eligibility checks.
- `PUT /api/v1/drives/:id` — Update drive details or stage.
- `DELETE /api/v1/drives/:id` — Cancel placement drive.

---

## 7. AI Resume Intelligence (`/api/v1/resume`)
- `POST /api/v1/resume/analyze` — Submit resume (Multer file upload or raw text) for AI-powered ATS scoring, skill extraction, and recommendations.
- `GET /api/v1/resume/history` — Fetch past resume analysis scores and reports.
- `GET /api/v1/resume/:id` — Get individual analysis breakdown.

---

## 8. AI Placement Assistant (`/api/v1/ai`)
- `POST /api/v1/ai/chat` — Conversational AI placement coach for DSA, interview strategy, and preparation.
- `POST /api/v1/ai/interview-prep` — Generate customized company-specific mock interview questions.
- `GET /api/v1/ai/readiness-score` — Calculate 0-100 Placement Readiness Score with personalized breakdown.
- `GET /api/v1/ai/recommended-jobs` — AI-powered job matching based on student skills & eligibility.

---

## 9. Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics/overview` — Placement Cell KPIs (placement rate, active drives, total placed students).
- `GET /api/v1/analytics/branch-distribution` — Branch-wise placement percentages and academic analytics.
- `GET /api/v1/analytics/salary-metrics` — Salary tier breakdown, highest/average packages, and top recruiter stats.

---

## 10. Communication Hub (`/api/v1/announcements`)
- `GET /api/v1/announcements` — List university placement announcements and broadcast alerts.
- `POST /api/v1/announcements` — (Placement Cell) Publish new announcement with priority level.
- `DELETE /api/v1/announcements/:id` — Remove announcement.

---

## 11. System & Metrics
- `GET /health` — Health check endpoint (`status: healthy`).
- `GET /metrics` — Prometheus metrics scraping endpoint.
