# 🎓 PlacementOS

> **Open-source AI-powered placement operating system for students, colleges, universities, recruiters, and placement cells.**

PlacementOS is an open-source platform designed to modernize campus placements by bringing students, recruiters, universities, and placement teams into one intelligent ecosystem.

Our mission is to make placements transparent, data-driven, AI-powered, and accessible to every student.

---

# 🚀 Current Implementation

This contribution implements a **complete opportunity lifecycle** connecting **Students** and **Recruiters** — from posting an opportunity to tracking applications and analytics.

```
🏢 Recruiter posts an opportunity
        ↓
🧠 Matching Engine evaluates student profiles
        ↓
📊 Relevance and eligibility are calculated
        ↓
🔔 Qualified students receive notifications
        ↓
🎓 Students browse and discover all opportunities
        ↓
✨ Matching opportunities show personalized match insights
        ↓
📝 Eligible matching students can apply
        ↓
📈 Recruiters can monitor opportunities and analytics
```

Read the full implementation guide: **[docs/smart-opportunity-discovery.md](docs/smart-opportunity-discovery.md)** (architecture, matching logic, API overview, setup, and tests).

---

# ✨ Implemented Features

## 🎓 Student Experience

- Student profile management (edit skills, academic info, and preferences)
- Skills management
- Career / domain preferences
- Location preferences
- Opportunity type preferences
- Browse all posted opportunities
- Search opportunities
- Contextual / progressive filters (type, location, work mode)
- Personalized opportunity matching
- Match scores (0–100)
- Relevance indicators
- Eligibility checking
- Match explanations ("why this matches you")
- Matched and missing skills
- Notifications for qualified opportunities (read / unread management)
- Apply to eligible matching opportunities
- Backend-enforced application rules
- Duplicate application prevention

## 🏢 Recruiter Experience

- Role-based recruiter experience (distinct dashboard from the student view)
- Post opportunities
- Define opportunity requirements (role, domain, description, type, work mode)
- Define required skills
- Define locations
- Define eligibility criteria (CGPA, branches, graduation years, max backlogs)
- View posted opportunities (active / expired / closed)
- Opportunity analytics
- **Students evaluated** — every student the engine scored
- **Relevant matches** — students above the relevance threshold
- **Eligible students** — students who pass all eligibility checks
- **Students notified** — students who received an automated notification
- **Real applications received** — actual applications submitted by students
- Opportunity close flow (stop new applications, mark a posting closed)

## 🧠 Matching Engine

The core of the platform. It:

- Evaluates every student profile against every opportunity
- Calculates relevance / match scores (0–100)
- Checks eligibility separately
- Uses student skills and preferences
- Considers role / domain preferences
- Considers location preferences
- Considers opportunity type
- Checks CGPA, branch, graduation year, and active backlogs
- Drives notifications (qualified students are notified automatically)
- Controls whether a student can apply

> **Relevance and eligibility are separate concepts.** A student can be highly relevant to a role yet ineligible for it (e.g. wrong branch or below the CGPA cut-off), and eligibility checks never inflate or deflate a match score. The UI and the application engine treat the two independently.

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

## ✅ Currently Used

The technologies actually present in this implementation branch (confirmed in the repo):

**Frontend:**
- React 19 (JavaScript)
- Vite 8 (build tooling / dev server)
- Tailwind CSS 4

**Backend:**
- Node.js (ES modules)
- Express 5 (REST API)

**Testing & Linting:**
- Node's built-in test runner (`node --test`) for backend unit tests
- `oxlint` for frontend static checks

**APIs**
- REST APIs (`fetch` from the frontend, Express routes on the backend)

> Data is currently held in **in-memory seed data** — there is no database yet. All state resets on a backend restart by design.

---

## 🧭 Vision / Roadmap Technology

The platform's long-term architecture targets broader infrastructure, which has **not** yet been implemented in this branch:

- **Frontend:** TypeScript, Redux Toolkit
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, OAuth 2.0
- **Storage:** Cloudinary
- **Real-Time:** Socket.IO
- **Infrastructure:** Docker, GitHub Actions, Nginx

These represent the intended future architecture and are separate from what is implemented today.

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
