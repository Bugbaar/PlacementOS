# Smart Opportunity Discovery

This document describes the first implemented end-to-end feature of PlacementOS: **Smart Opportunity Discovery and Matching**. It is written for reviewers of the contribution and covers what is implemented, how it works, and how to run it.

- **Stack (implemented):** React 19 + Vite + Tailwind CSS 4 (frontend, JavaScript), Express 5 (backend), in-memory seed data, oxlint, Node's built-in test runner.
- **Status:** scoped contribution — see [Scope & non-goals](#11-scope-non-goals).

---

## 1. Implemented Contribution

Smart Opportunity Discovery replaces a static list of jobs with a proactive, ranked, and explained experience. Given a student profile, the system evaluates every opportunity and surfaces the ones most relevant to that student, ranked by match score.

A student's discovery experience is personalized by:

- **Skills** — compared against each opportunity's required skills.
- **Preferred roles / domains** — e.g. "Frontend Developer", "Web Development".
- **Preferred locations** — e.g. "Bengaluru", "Remote".
- **Preferred opportunity types** — Internship vs Full-time.
- **Eligibility criteria** — CGPA, branch, graduation year, and active backlogs.

Every result explains *why* it was matched (skills, role/domain, location, type) and reports eligibility separately from relevance.

---

## 2. Problem Statement

Placement opportunities are scattered across portals, emails, and WhatsApp groups. Students must manually check each platform, compare opportunities against their own profile, and reason about eligibility for every posting on their own.

The result: **qualified students miss relevant internships and jobs** simply because the opportunities were never surfaced to them.

Smart Opportunity Discovery moves from *passive browsing* toward *proactive discovery*:

- the student's profile is the starting point, not a job search box;
- opportunities are scored and ranked for that specific student;
- eligibility roadblocks are called out up front, before a student wastes time applying;
- new relevant opportunities generate notifications, so students do not have to poll the platform.

---

## 3. Key Features

| Feature | What it does |
|---|---|
| Opportunity search | Full-text search over role, company, domain, and required skills. |
| Filtering | Filter by opportunity type (Internship / Full-time), location, and work mode (Remote / Hybrid / On-site). |
| Student profile preferences | Preferred roles, domains, locations, opportunity types, and skills drive matching. |
| Opportunity matching | Every opportunity is scored against the student's profile. |
| Match score calculation | Deterministic 0–100 score from four weighted dimensions. |
| Skills matching | Proportional scoring against required skills (matched / missing reported). |
| Role / domain matching | Checks the opportunity role or domain against preferred roles/domains. |
| Location matching | Checks opportunity locations against preferred locations (Remote always counts). |
| Opportunity type matching | Checks Internship / Full-time against preferred types. |
| Eligibility verification | Binary checks for CGPA, branch, graduation year, and backlogs — independent of match score. |
| Transparent match explanations | Per-dimension breakdown ("Why this match") shown on every card. |
| Ranked opportunities | Results sorted by match score, descending. |
| Relevant opportunity notifications | Auto-notification when a new opportunity strongly matches an eligible student. |
| Read / unread management | Unread badge, mark-one-read, and mark-all-as-read. |

---

## 4. Architecture

```
Frontend (React · Vite · Tailwind)
          │  fetch() / REST
          ▼
REST API (Express)  routes → controllers → services
          │
          ▼
Matching Engine (matchingService)
          │
          ├──► Student Profiles + Opportunities (in-memory seed data)
          │
          ▼
Eligibility Evaluation  (CGPA · branch · year · backlogs)
          │
          ▼
Match Results  (matchScore · relevant · eligible · explanations)
          │
          ▼
Notification Service (notificationService) — reuses the Matching Engine
```

**Backend flow:** `routes` define the HTTP surface → `controllers` validate and shape responses → `services` hold domain logic (matching, eligibility, notifications) over the in-memory data modules.

```
backend/src
├── routes/          HTTP routing (health, students, opportunities, matches, notifications)
├── controllers/     Request handling + response shaping
├── services/        Domain logic (student, opportunity, matching, notification)
├── data/            In-memory seed data (students, opportunities, notifications)
└── server.js        Express app wiring, CORS, JSON body parsing, API 404 + error handling
```

---

## 5. Matching Logic

### Scoring weights

The match score is a weighted sum of four dimensions. Weights are frozen constants in `matchingService.js`.

```
skills           50  (proportional — higher when more required skills are matched)
role / domain    20  (binary — matches a preferred role or domain)
location         15  (binary — matches a preferred location, or the role is Remote)
opportunity type 15  (binary — Internship / Full-time preference)
TOTAL           100
```

**Skills (50 pts):** skills are normalized (lowercased, trimmed, de-duplicated). The coverage percentage is `matched required skills / total required skills` (an opportunity with no required skills counts as 100%). Score = `percentage × 0.5`. The exact list of matched and missing skills is returned for display.

**Role/domain (20 pts), location (15 pts), opportunity type (15 pts):** each is a binary check with a small fuzzy component — a preference is satisfied if it is contained *in* the opportunity value or contains it (e.g. preferred location "Bengaluru" matches posting location "Bengaluru, Karnataka"). A **Remote** work mode always satisfies location. **Empty preferences are treated as "no restriction"** and count as satisfied.

The final score is the sum, **rounded to one decimal place** and capped at 100.

### Relevance vs eligibility

- **Relevant:** `matchScore ≥ 50` (`RELEVANCE_THRESHOLD`). Measures how well the opportunity fits the student's skills and preferences.
- **Eligible:** four binary checks, each with a human-readable reason: `minimumCgpa`, `allowedBranches`, `graduationYears`, `maximumActiveBacklogs`. All four must pass. Missing criteria on an opportunity are treated as "no restriction" and pass.

**Relevance and eligibility are intentionally independent.** A strong skills match never makes an ineligible student eligible, and eligibility checks never inflate or deflate a match score. A student can be highly relevant but ineligible (wrong branch, below CGPA) — the UI shows both dimensions separately.

---

## 6. Notification Flow

Creating an opportunity (`POST /api/opportunities`) evaluates every student asynchronously:

```
New Opportunity Created
        ↓
All students evaluated
        ↓
Matching Engine reused
        ↓
Relevant + Eligible + Above Threshold
        ↓
Notification Created
```

- **Async:** notification generation is scheduled with `setImmediate` so the create request returns immediately; generation is wrapped in `try/catch` so a failure never breaks opportunity creation.
- **Threshold:** a notification is only created when the match is `relevant`, `eligible`, **and** `matchScore ≥ 70` (`MIN_MATCH_SCORE_FOR_NOTIFICATION`).
- **Duplicate prevention:** a student is never notified twice about the same opportunity — each (student, opportunity) pair is created at most once.
- **Shape:** notifications carry a title, message, the match score, `read: false`, and a timestamp; GET responses embed the related opportunity.
- **Read management:** `PATCH` a single notification as read, or mark all of a student's notifications read. GET returns `count`, `unreadCount`, and the list newest-first.

---

## 7. API Overview

Base URL: `http://localhost:5000/api` (configurable — see [Setup](#8-setup)). All routes return JSON. Errors use a consistent envelope:

```json
{ "success": false, "error": { "code": "OPPORTUNITY_NOT_FOUND", "message": "Opportunity not found" } }
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check. |
| GET | `/students` | List all student profiles. |
| GET | `/students/:id` | Single student profile. |
| GET | `/opportunities` | List all opportunities. |
| GET | `/opportunities/:id` | Single opportunity. |
| POST | `/opportunities` | Create an opportunity; schedules notification generation. |
| GET | `/students/:studentId/opportunities/matches` | Ranked matches for a student (score, relevance, eligibility, explanations + embedded opportunity). |
| GET | `/students/:studentId/opportunities/:opportunityId/match` | Single match for one opportunity. |
| GET | `/students/:studentId/notifications` | Notifications for a student (`count`, `unreadCount`, newest-first, embedded opportunity). |
| PATCH | `/notifications/:notificationId/read` | Mark one notification as read. |
| PATCH | `/students/:studentId/notifications/read-all` | Mark all of a student's notifications as read. |

---

## 8. Setup

Requirements: a recent Node.js LTS with npm (developed/tested on Node 22).

**Backend** (port `5000`):

```bash
cd backend
npm install
npm run dev          # starts http://localhost:5000 via nodemon
```

**Frontend** (port `5173`):

```bash
cd frontend
npm install
npm run dev          # starts http://localhost:5173 via Vite
```

Open `http://localhost:5173`. The page loads ranked matches and the notification bell for the seeded mock student (Ananya Sharma, `student_001`). Both servers must run simultaneously; CORS is enabled on the backend.

**Environment variables** (optional — sane defaults exist, see `frontend/.env.example`):

| Variable | Default | Used by | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Frontend | Base URL of the backend REST API. |
| `VITE_CURRENT_STUDENT_ID` | `student_001` | Frontend | Which student profile the demo UI operates as. |
| `PORT` | `5000` | Backend | Port the Express server listens on. |

To override frontend variables, copy `frontend/.env.example` to `frontend/.env.local` (git-ignored) and edit.

> **Note:** all data is in-memory. Restarting the backend re-seeds the 4 student profiles and 8 opportunities and clears notifications. This is by design for the scoped contribution (see [Engineering decisions](#10-engineering-decisions)).

---

## 9. Testing

**Backend automated tests** — Node's built-in test runner:

```bash
cd backend
npm test              # runs node --test tests/*.test.js
```

Coverage: matching/eligibility behavior and notification logic. **Verified: 33 tests passing** (`matching.test.js` + `notifications.test.js`).

**Frontend static checks and build:**

```bash
cd frontend
npm run lint          # oxlint
npm run build         # production Vite build
```

Both pass cleanly on this contribution.

**Manual end-to-end check:** with both servers running, `POST` a new opportunity that targets the mock student (e.g. a React/JavaScript internship in a preferred location) — it appears ranked near the top of the discovery page, and the notification bell shows a new unread notification with the match score.

---

## 10. Engineering Decisions

1. **Deterministic matching instead of AI/LLMs.** Scores are reproducible, cheap, and explainable — every point can be traced to a specific skill or preference. This provides a transparent baseline that a later AI layer can build on, without hiding decisions behind a model.
2. **Eligibility is separate from relevance.** A strong skills fit can still be a dead end (wrong branch, below CGPA, backlogs). Keeping the two dimensions independent lets the UI show "relevant but not eligible" honestly and prevents eligibility rules from skewing ranking.
3. **The matching service is a pure, reusable function** over plain data. Both the matches API and the notification service call the same `matchStudentToOpportunity` — one source of truth for scoring means a notification and a ranked list can never disagree.
4. **Notifications reuse the matching engine.** Notified opportunities are, by construction, the top relevant + eligible matches — so the notification bell and the ranked page are always consistent.
5. **Mock in-memory data for this scoped contribution.** No database or infrastructure is required to run or review the feature. The service layer is decoupled from persistence, so wiring a real data source later is a straightforward swap. This is **not** production infrastructure.

---

## 11. Scope & Non-goals

The following are **not** implemented here and are intentionally out of scope for this contribution:

- Authentication / authorization / roles — the UI operates as a fixed mock student (`student_001`).
- Application / apply flow, resume builder, recruiter portal, analytics.
- Persistence — data is in-memory and resets on restart.
- AI/LLM-based matching — matching is deterministic by design.

The wider PlacementOS roadmap and product vision live in the repository [README](../README.md).