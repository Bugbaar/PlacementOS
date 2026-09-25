# Recruiter Portal — Job Posting & Applicant Tracking

Contribution for PlacementOS as part of the Bugbaar Internship Round 1 challenge.

## What this adds

A working slice of the **Recruiter Portal** module described in the PlacementOS README:

- Recruiters can **create, view, and close job postings** (title, company,
  location, employment type, CTC, eligibility criteria, deadline).
- Recruiters can **view the list of applicants** for a specific posting and
  **move each applicant through a hiring pipeline**
  (`applied → shortlisted → interview → hired/rejected`).
- A seed script populates sample jobs and applications so the feature is
  demoable without needing a full auth + student-facing flow first.

## What this intentionally leaves out (and why)

The Recruiter Portal section in the README also lists Candidate Discovery,
Resume Screening, and Interview Scheduling. Those depend on the AI Resume
Intelligence module and an auth system that don't exist in the repo yet, so
building them now would mean stubbing out most of their value. I scoped this
PR to the part of the Recruiter Portal that's fully useful on its own:
posting jobs and tracking who applied.

Auth is also out of scope — `DEMO_RECRUITER_ID` is hardcoded in
`RecruiterDashboard.tsx` with a comment marking where it should be swapped
for the real logged-in recruiter once the auth module lands.

## Stack (matches the repo's stated stack)

- **Backend:** Node.js, Express, MongoDB/Mongoose
- **Frontend:** React, TypeScript, Tailwind CSS, Vite

## Project layout

```
backend/
  models/          Job.js, Application.js
  controllers/      jobController.js, applicationController.js
  routes/           jobRoutes.js, applicationRoutes.js
  config/db.js
  server.js
  seed.js           populates sample jobs/applications for demo

frontend/
  src/types/         shared TS types
  src/api/           fetch wrappers for the backend API
  src/components/     JobForm, JobList, ApplicantList
  src/pages/          RecruiterDashboard
```

## Running it locally

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # point MONGO_URI at your local/Atlas Mongo
npm run seed               # optional: adds sample jobs + applicants
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API endpoints added

| Method | Endpoint                          | Purpose                          |
|--------|-------------------------------------|-----------------------------------|
| POST   | `/api/jobs`                        | Create a job posting             |
| GET    | `/api/jobs?recruiterId=&status=`   | List postings (with applicant counts) |
| GET    | `/api/jobs/:id`                    | Get one posting                  |
| PATCH  | `/api/jobs/:id`                    | Edit / close a posting           |
| DELETE | `/api/jobs/:id`                    | Remove a posting                 |
| GET    | `/api/jobs/:id/applications`       | List applicants for a posting    |
| POST   | `/api/applications`                | Student applies to a job         |
| PATCH  | `/api/applications/:id/status`     | Move an applicant through the pipeline |

## Verification done

- All backend files pass `node --check` (syntax-valid).
- Frontend passes `tsc --noEmit` with zero type errors and builds cleanly
  with `vite build`.
- Full DB round-trip wasn't run in this environment (no outbound access to
  download a local Mongo binary), so please sanity-check the API against a
  real MongoDB instance before merging — the seed script is there to make
  that quick.
