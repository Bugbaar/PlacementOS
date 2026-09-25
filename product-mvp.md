# PlacementOS — Product MVP

This document describes the **current product** shipped in this repository. It is separate from the long-term platform vision in `README.md`.

Same login URL serves two personas, distinguished by account **`role`**:

| Persona | Role | Shell look | Primary home |
|--------|------|------------|--------------|
| **Student** | `student` | Light blue **PlacementOS** sidebar | `/dashboard` |
| **Placement Cell (Admin)** | `admin` | Dark **Placement Cell / Admin console** sidebar | `/shortlist` |

Stack: React + TypeScript + Tailwind + Redux Toolkit; Node.js + Express + MongoDB + JWT; optional Groq (assistant) and optional multi-LLM for Resume Fit.

---

## What this MVP is

PlacementOS helps campuses run placements with:

1. A **student intelligence** portal (readiness, match scores, applications, AI coaching, resume–JD fit)
2. A **placement cell** console (CSV shortlisting engine with explainable rules and exports)
3. A **Python eligibility/analytics sidecar** for offline CSV demos (`tools/eligibility-analytics/`)

College-wide analytics UIs, recruiter portals, resume builders, and WhatsApp/email hubs remain roadmap-only.

---

## Who it is for (today)

| Persona | What they get |
|--------|----------------|
| **Student** | Profile, recommendations, opportunity eligibility/match, applications, AI assistant, Resume Fit |
| **Placement Cell Admin** | Distinct admin shell, Cell Overview, Shortlist Engine (CSV + criteria + exports), opportunities browse, admin profile |

---

## How roles work

- Seed accounts live in `backend/.env` (`SEED_STUDENT_*`, `SEED_ADMIN_*`).
- JWT carries `role`. APIs use `authenticate` / `requireAdmin` where needed.
- **Shortlist Engine** (`/api/shortlist/*`) is **admin-only**.
- UI: student nav vs placement-cell nav; admin login lands on Shortlist Engine.

---

## Core capabilities

### Shared
- Secure email/password login (JWT)
- Mongo-backed students and opportunities

### Student
- Profile as source of truth for matching and AI
- Opportunity discovery with explainable match %
- Opportunity detail: hard eligibility + skill gaps; apply / save
- Application tracker
- Placement readiness score + insights
- AI Placement Assistant (Groq)
- Resume–JD Fit Scorer (PDF + JD)

### Placement Cell Admin
- Admin console branding (dark sidebar)
- Cell Overview shortcuts
- Shortlist Engine: upload CSV, set drive rules, run engine, view logs/table, export CSV/PDF
- Opportunities list (campus drives students also see)

---

# Scenario A — Student portal

Use a **student** account. After login you see the light **PlacementOS** shell.

### A1. Sign in
Login screen for PlacementOS. Use student email/password from seed env.

<img width="723" height="642" alt="Student sign in" src="https://github.com/user-attachments/assets/e7f53925-d527-4137-8c6e-ef9524fa0834" />

### A2. Student dashboard
Greeting, **Placement Readiness** score, quick stats, AI insights, and **Recommended for You** roles with match %.

<img width="1873" height="955" alt="Student dashboard" src="https://github.com/user-attachments/assets/735ac41e-72e1-4722-9740-783d6d3920bb" />

### A3. My Profile
Edit personal info, education, and skills that drive matching and AI context.

<img width="1780" height="971" alt="Student profile" src="https://github.com/user-attachments/assets/19799eca-3564-4961-af03-7d8a498edf11" />

### A4. Opportunities
Browse open roles with match scores; optional high-match filtering.

<img width="1872" height="982" alt="Opportunities list" src="https://github.com/user-attachments/assets/d8746003-6dcb-4382-809c-0ae985600f0c" />

### A5. Opportunity details
Eligibility against hard rules (e.g. CGPA), matched vs missing skills, apply or save.

<img width="1872" height="982" alt="Opportunity details eligibility" src="https://github.com/user-attachments/assets/d4a8913d-0838-466e-9bd2-89da63d571c8" />

<img width="1827" height="962" alt="Opportunity details apply" src="https://github.com/user-attachments/assets/2760304f-a29e-4908-8bd0-152ef6b8b616" />

### A6. Applications
Track submitted applications and status.

<img width="1767" height="962" alt="Applications tracker" src="https://github.com/user-attachments/assets/7ec69142-3d7a-42ab-87fb-48172281ea05" />

### A7. AI Assistant
Suggested prompts grounded in the live student profile; coaching replies for ranking roles and skill gaps.

<img width="1886" height="975" alt="AI assistant" src="https://github.com/user-attachments/assets/a2552fcc-752c-4fea-a2d8-141b42da95c4" />

<img width="1907" height="957" alt="AI coaching reply" src="https://github.com/user-attachments/assets/33085228-7b0d-487f-b89b-ae24a647070e" />

### A8. Resume Fit
Upload a PDF resume and paste a job description → match %, matched/missing skills, top relevant bullets.

_Add screenshot: Resume Fit page (form)_  
_Add screenshot: Resume Fit results (optional)_

---

# Scenario B — Placement Cell (Admin) portal

Use an **admin** account (e.g. seed `SEED_ADMIN_EMAIL`). After login you see the dark **Placement Cell · Admin console** shell and typically land on **Shortlist Engine**.

### B1. Sign in as placement officer
Same login URL; admin credentials. Copy can say student *or* placement cell admin.

_Add screenshot: login (admin credentials / note)_

### B2. Cell Overview
Admin home: short intro plus cards to **Shortlist Engine** and **Opportunities**.

### 9. Resume Fit
Student uses **Resume Fit** in the sidebar (with Dashboard readiness, insights, and role match %) to open the Resume–JD Fit Scorer — upload a PDF + paste a JD for skill match, gaps, and relevant bullets.
<img width="1572" height="950" alt="image" src="https://github.com/user-attachments/assets/91ffaa07-3d4c-4e2e-b790-0e1153662ae4" />


### B3. Shortlist Engine — criteria & upload
Admin sets:

- Company / drive name  
- Min CGPA, max active backlogs  
- Required skills + match mode (all / any)  
- Optional allowed branches  
- Student CSV upload (sample: `frontend/public/sample-students-500.csv`)

Then runs **Run shortlisting engine**.

_Add screenshot: Shortlist Engine form (before or with file chosen)_

### B4. Shortlist Engine — results
After a run, admin sees:

- Totals: total / shortlisted / rejected / rate %  
- Export: shortlist CSV, audit CSV, PDF  
- Pipeline logs (`MATCH` / `REJECT` with reasons)  
- Table of shortlisted students (roll, name, branch, CGPA, status)

_Add screenshot: metrics + exports + logs_  
_Add screenshot: shortlisted students table_

### B5. Opportunities (admin view)
Browse campus opportunities from the placement-cell nav (same opportunity data students use).

_Add screenshot: opportunities from admin shell_

### B6. Admin profile
**Admin** nav item opens the signed-in officer’s account/profile (not a full student directory yet).

_Add screenshot: admin profile (optional)_

---

## Student vs Placement Cell — at a glance

| Area | Student | Placement Cell Admin |
|------|---------|----------------------|
| Shell | Light PlacementOS | Dark Placement Cell console |
| Home | Readiness + recommendations | Cell Overview / Shortlist |
| Shortlist CSV engine | No | Yes |
| Resume Fit / AI chat | Yes | Not in admin nav (student tools) |
| Opportunity apply flow | Yes | Browse only in this MVP |

---

## Eligibility & placement analytics tool (Python)

CSV-driven eligibility + analytics sidecar under `tools/eligibility-analytics/`. Separate from the live MERN shortlist UI; useful for offline demos and tests.

| Area | Behavior |
|------|----------|
| **Eligibility** | CGPA, branch, graduation year, required skills per student × drive |
| **Reasons** | Explainable failures |
| **Safety** | Rejects invalid / non-finite CGPA |
| **Analytics** | Overall rate, top missing skills, branch-wise rates |

```bash
cd tools/eligibility-analytics
python -m pip install -r requirements.txt
python main.py
python -m pytest -v
```

_Add screenshot: terminal eligibility results (optional)_  
_Add screenshot: terminal analytics summary (optional)_

See [tools/eligibility-analytics/README.md](./tools/eligibility-analytics/README.md).

---

## Resume versioning (in-memory MVP)

API-only for now: multiple named resume versions; one active; JWT self or admin.

| Capability | Detail |
|------------|--------|
| Create / list / get | `/api/students/:studentId/resumes` |
| Activate | `POST .../:versionId/activate` |
| Delete | Inactive versions only |
| Storage | In-memory (resets on restart) |

See [docs/resume-versioning.md](./docs/resume-versioning.md).

---

## Feature reference (URLs & APIs)

### Student

| Feature | UI | API notes |
|---------|----|-----------|
| Dashboard | `/dashboard` | Recommendations, readiness (client) |
| Profile | `/profile` | Student CRUD |
| Opportunities | `/opportunities`, `/opportunities/:id` | Public list; match/eligibility server-side |
| Applications | `/applications` | Auth |
| AI Assistant | `/assistant` | `POST /api/assistant/chat` + `GROQ_API_KEY` |
| Resume Fit | `/resume-fit` | `POST /api/resume-fit` (JWT); optional LLM keys |

### Placement Cell Admin

| Feature | UI | API notes |
|---------|----|-----------|
| Cell Overview | `/dashboard` (admin variant) | — |
| Shortlist Engine | `/shortlist` | `/api/shortlist/*` (JWT + admin); in-memory batches |
| Opportunities | `/opportunities` | Same as student browse |
| Admin profile | `/profile` | Own account |

See [docs/api.md](./docs/api.md) and [docs/resume-fit-module.md](./docs/resume-fit-module.md).

---

## How this fits the wider PlacementOS vision

`README.md` describes the full multi-sided OS (students, placement cells, recruiters, analytics, communications). **This file is what exists in code today**: dual-persona student + placement-cell MVP, Python eligibility tool, resume versioning API, and resume–JD fit.
