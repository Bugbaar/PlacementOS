# PlacementOS — Student Intelligence MVP

This document describes the **current product** shipped in this repository: a student-facing placement intelligence MVP. It is separate from the long-term platform vision in `README.md`.

## What this MVP is

PlacementOS Student Intelligence helps a campus student understand **where they stand**, **which roles fit them**, and **what to do next** — without spreadsheets or guesswork.

The product combines:

1. A **deterministic matching and eligibility engine** (scores and gaps you can explain)
2. A **readiness signal** based on the live student profile
3. An **AI placement assistant** (Groq) that answers using that same profile data — not generic career advice

Stack: React + TypeScript + Tailwind + Redux Toolkit on the frontend; Node.js + Express + MongoDB + JWT auth on the backend; optional Groq for chat.

## Who it is for (today)

| Persona | What they get in this MVP |
|--------|---------------------------|
| **Student** | Profile, recommendations, applications, AI coaching |
| **Admin** | Manage opportunities and broader student data via protected APIs |

College dashboards, recruiter portals, resume builders, and WhatsApp/email hubs are **not** part of this MVP (roadmap only).

## Core product capabilities

### Secure student access
Students register or sign in with email and password. Protected APIs use JWT.

### Profile as the source of truth
Students maintain personal details, education (college, branch, CGPA, graduation year), skills, and role/location preferences. Matching, readiness, and the AI assistant all read from this profile.

### Opportunity discovery with explainable fit
Students browse roles and see a **match percentage** driven by skills, academics, and preferences. Filters help focus on stronger fits (for example high-match roles).

### Opportunity detail: eligibility, skills, action
On a single role, students see eligibility against hard rules (such as CGPA), matching vs missing skills, and can **apply** or **save** the opportunity.

### Application tracking
Submitted applications appear in one tracker with status the student can follow as the process moves forward.

### Placement readiness
A rule-based readiness score summarizes how complete and competitive the profile looks, with short guidance to improve it.

### AI Placement Assistant
A chat experience grounded in the student's real profile, recommendations, and applications. Useful for prioritize-what-to-apply, skill-gap plans, interview prep, and explaining match scores. Requires a configured `GROQ_API_KEY` (model configurable via `GROQ_MODEL`).

## Product walkthrough

### 1. Sign in
Student lands on the login screen and authenticates into the portal.
<img width="723" height="642" alt="Screenshot 2026-09-24 190613" src="https://github.com/user-attachments/assets/e7f53925-d527-4137-8c6e-ef9524fa0834" />


### 2. Dashboard
Overview of readiness, quick stats, short insights, and top recommended roles.
<img width="1873" height="955" alt="Screenshot 2026-09-24 190759" src="https://github.com/user-attachments/assets/735ac41e-72e1-4722-9740-783d6d3920bb" />


### 3. My Profile
Student edits personal info, education, and skills that drive matching and AI context.
<img width="1780" height="971" alt="Screenshot 2026-09-24 190840" src="https://github.com/user-attachments/assets/19799eca-3564-4961-af03-7d8a498edf11" />


### 4. Opportunities
Student browses open roles with match scores and optional high-match filtering.
<img width="1872" height="982" alt="Screenshot 2026-09-24 190901" src="https://github.com/user-attachments/assets/d8746003-6dcb-4382-809c-0ae985600f0c" />


### 5. Opportunity details
Student reviews eligibility, skill fit, and applies or saves the role.
<img width="1872" height="982" alt="Screenshot 2026-09-24 190901" src="https://github.com/user-attachments/assets/d4a8913d-0838-466e-9bd2-89da63d571c8" />
<img width="1827" height="962" alt="Screenshot 2026-09-24 190915" src="https://github.com/user-attachments/assets/2760304f-a29e-4908-8bd0-152ef6b8b616" />


### 6. Applications
Student tracks submitted applications and status in one list.
<img width="1767" height="962" alt="Screenshot 2026-09-24 191050" src="https://github.com/user-attachments/assets/7ec69142-3d7a-42ab-87fb-48172281ea05" />


### 7. AI Assistant
Student opens the assistant with suggested prompts tied to their live profile.
<img width="1886" height="975" alt="Screenshot 2026-09-24 191106" src="https://github.com/user-attachments/assets/a2552fcc-752c-4fea-a2d8-141b42da95c4" />

### 8. AI coaching reply
Example conversation where the assistant ranks opportunities and calls out skill gaps.
<img width="1907" height="957" alt="Screenshot 2026-09-24 192417" src="https://github.com/user-attachments/assets/33085228-7b0d-487f-b89b-ae24a647070e" />

## How this fits the wider PlacementOS vision

`README.md` describes the full multi-sided operating system (students, placement cells, recruiters, analytics, communications). **This file is only the student intelligence slice that exists in code today.**
