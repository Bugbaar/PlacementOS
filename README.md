# 🎓 PlacementOS

> **Open-source AI-powered placement operating system for students, colleges, universities, recruiters, and placement cells.**

PlacementOS is an open-source platform designed to modernize campus placements by bringing students, recruiters, universities, and placement teams into one intelligent ecosystem.

Our mission is to make placements transparent, data-driven, AI-powered, and accessible to every student.

---

## ✨ Current MVP: Student Placement Workspace

The repository now includes a working full-stack student journey. A student can:

- Explore public opportunities in guest mode without creating an account
- Discover and filter active placement drives
- See an explainable eligibility decision for every drive
- Understand which academic rule passed or failed
- Compare matched and missing role skills
- Save or submit an application
- Track applications across five pipeline stages
- Add a placement deadline to any calendar with an `.ics` export
- Export their application history as a portable CSV file
- Update their academic profile and recalculate every match instantly
- Sign in as different seeded students with genuinely different profiles and pipelines
- Use working notifications, analytics, help, settings, and account switching

The MVP is intentionally focused on one complete, reliable workflow rather than a shallow implementation of every planned module.

### Quick start

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies API requests to the Express server on `http://localhost:4000`. Seeded product data is included, so no database or API keys are required.

Visitors land in the guest explorer first. Personal actions clearly invite sign-in, where reviewers can choose Aarav, Priya, or Kabir. The shared preview password is `placement123`. Authentication is explicitly a local evaluation flow; production JWT/OAuth is listed in the roadmap.

### Quality checks

```bash
npm run test   # backend domain/API tests + frontend integration test
npm run build  # strict TypeScript and production builds
npm run check  # complete pre-PR check
```

### Implemented architecture

```text
frontend/   React 19, TypeScript, Tailwind CSS, Redux Toolkit, Vite
backend/    Express 5, TypeScript, Zod validation, tested domain engine
docs/       Architecture decisions and production roadmap
.github/    Pull-request CI workflow
```

The current persistence layer is intentionally in memory for zero-configuration evaluation. It is isolated behind `PlacementStore` so MongoDB/Mongoose can be introduced without changing domain rules or frontend contracts. See [the architecture notes](docs/ARCHITECTURE.md) and [contribution guide](CONTRIBUTING.md).

### REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `GET` | `/api/drives/public` | Public opportunity catalogue for guest exploration |
| `GET` | `/api/auth/demo-users` | Public demo-account choices |
| `POST` | `/api/auth/login` | Validate a demo sign-in |
| `GET` | `/api/dashboard/:studentId` | Student, drives, decisions, applications, and summary |
| `PATCH` | `/api/students/:studentId` | Validate and update an eligibility profile |
| `POST` | `/api/applications` | Save or apply to a drive |
| `PATCH` | `/api/applications/:applicationId` | Move an application to a new stage |

---

# 🤔 Why PlacementOS?

Campus placements are still managed through spreadsheets, emails, WhatsApp groups, and disconnected portals.

Students struggle to:

- Find placement opportunities
- Track applications
- Build ATS-friendly resumes
- Prepare for interviews
- Understand eligibility criteria

Placement cells struggle to:

- Manage thousands of students
- Verify eligibility
- Communicate updates
- Generate reports
- Coordinate recruiters

Recruiters struggle to:

- Discover qualified candidates
- Screen resumes efficiently
- Schedule interviews
- Manage hiring pipelines

PlacementOS brings everything together into one intelligent platform.

---

# 🎯 Vision

Build the world's leading open-source placement operating system.

A platform where:

- 🎓 Students discover opportunities.
- 🏫 Colleges manage placements efficiently.
- 🏢 Recruiters hire the right talent.
- 🤖 AI accelerates the hiring process.
- 🌍 Communities connect talent with opportunities.

---

# 🚀 Mission

Empower every student with equal access to career opportunities while enabling educational institutions and recruiters with modern, AI-driven placement infrastructure.

---

# 🧩 Platform Modules

## 🎓 Student Portal

A personalized placement dashboard.

### Features

- Student Profile
- Resume Builder
- Skill Profile
- Portfolio
- Placement Timeline
- Application Tracker

---

## 🏫 Placement Cell Dashboard

Manage campus placements efficiently.

### Features

- Student Database
- Company Management
- Drive Management
- Eligibility Engine
- Bulk Communication
- Reports & Analytics

---

## 🏢 Recruiter Portal

A complete hiring workspace.

### Features

- Company Dashboard
- Job Posting
- Candidate Discovery
- Resume Screening
- Interview Scheduling
- Hiring Pipeline

---

## 📄 AI Resume Intelligence

Improve resume quality using AI.

### Features

- ATS Score
- Resume Review
- Skill Extraction
- Resume Suggestions
- Resume Versioning

---

## 🤖 AI Placement Assistant

Personal career guidance.

### Features

- Career Roadmaps
- Interview Preparation
- Company Recommendations
- Skill Recommendations
- Resume Feedback
- Placement Readiness Score

---

## 📝 Placement Drive Management

End-to-end placement workflow.

### Features

- Drive Creation
- Registration
- Eligibility Verification
- Shortlisting
- Interview Scheduling
- Offer Management

---

## 📊 Analytics Dashboard

Placement insights for institutions.

### Features

- Placement Statistics
- Company Analytics
- Student Performance
- Department Reports
- Salary Analytics
- Placement Trends

---

## 💬 Communication Hub

Keep everyone informed.

### Features

- Announcements
- Notifications
- Email Integration
- WhatsApp Integration
- Discussion Forums

---

# 🌍 Who Is It For?

PlacementOS is built for:

- Students
- Universities
- Colleges
- Placement Cells
- Recruiters
- Companies
- Career Coaches
- Training & Placement Officers

---

# 🏗 Technology Stack

## Frontend

- React.js
- TypeScript
- Tailwind CSS
- Redux Toolkit

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- OAuth 2.0

## Storage

- Cloudinary

## Real-Time

- Socket.IO

## Infrastructure

- Docker
- GitHub Actions
- Nginx

## APIs

- REST APIs

---

# 📂 Repository Structure

```text
placement-os
│
├── frontend/
├── backend/
├── docs/
├── infrastructure/
├── scripts/
├── .github/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── docker-compose.yml
```

---

# 🚧 Current Development Areas

We're actively looking for contributors in:

## 💻 Backend

- Student APIs
- Placement APIs
- Company APIs
- Recruiter APIs
- Authentication
- Notification System

## 🎨 Frontend

- Student Dashboard
- Placement Cell Dashboard
- Recruiter Portal
- Resume Builder
- Analytics Dashboard

## 🤖 AI

- Resume Analysis
- ATS Scoring
- Skill Extraction
- Placement Recommendations
- Career Assistant

## 📖 Documentation

- API Documentation
- System Architecture
- Setup Guide
- Contributor Guide

## ⚙ Infrastructure

- Docker
- CI/CD
- Monitoring
- Deployment

---

# 🌱 Good First Issues

Perfect for first-time contributors.

- Documentation
- UI Improvements
- API Endpoints
- Unit Tests
- Bug Fixes

Look for:

- `good-first-issue`
- `help-wanted`
- `documentation`

---

# 🤝 Contributing

We welcome:

- Backend Engineers
- Frontend Engineers
- AI Engineers
- DevOps Engineers
- UI/UX Designers
- Product Designers
- Technical Writers
- Students
- Placement Coordinators

Every contribution helps students discover better opportunities and helps institutions modernize their placement process.

---

# 🌎 Long-Term Vision

PlacementOS aims to become the global open infrastructure for campus recruitment.

Imagine a world where:

- Every student has access to equal placement opportunities.
- Colleges manage placements without spreadsheets or manual processes.
- Recruiters discover the best talent through AI-powered matching.
- Students receive personalized guidance throughout their career journey.
- Universities, companies, and communities collaborate through one connected platform.

This is the future we're building.

---

# ❤️ Join the Mission

If you're passionate about:

- Open Source
- Education Technology
- Artificial Intelligence
- Career Development
- Campus Placements
- Building Products That Matter

We'd love to build with you.

⭐ Star the repository

🐛 Report issues

🚀 Submit a Pull Request

🤝 Become a Founding Contributor

---

## Built by the **BugBaar Global** Community.

### **Empowering Students. Modernizing Placements. Creating Opportunities.**
