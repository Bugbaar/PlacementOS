# 🎓 PlacementOS

> **Open-source AI-powered placement operating system for students, colleges, universities, recruiters, and placement cells.**

PlacementOS is an open-source platform designed to modernize campus placements by bringing students, recruiters, universities, and placement teams into one intelligent ecosystem.

Our mission is to make placements transparent, data-driven, AI-powered, and accessible to every student.

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

# 📦 What is in this repo today

A student placement intelligence MVP (MERN) plus a Python eligibility/analytics tool under `tools/`.

**Product details, screenshots, and shipped features live in [product-mvp.md](./product-mvp.md)** — not in this vision README.

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bugbaar/PlacementOS.git
   cd PlacementOS
   ```

2. **Configure Environment:**
   Create `backend/.env` from `backend/.env.example`. Set `JWT_SECRET`, `CORS_ORIGIN`, `MONGO_URI` as needed, and `GROQ_API_KEY` / `GROQ_MODEL` for the AI assistant. For seeding, set the `SEED_*` variables in that same file (do not commit real values).

3. **Start with Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Seed the Database (Optional but recommended):**
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Open the app:** [http://localhost:5173](http://localhost:5173) and sign in with an account you registered or seeded.

6. **Optional — Python eligibility analytics tool:**
   ```bash
   cd tools/eligibility-analytics
   python -m pip install -r requirements.txt
   python main.py
   python -m pytest -v
   ```

---

# 🧩 Platform Modules (roadmap)

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
├── tools/
│   └── eligibility-analytics/   # Python CSV eligibility + analytics sidecar
├── .github/
├── README.md                    # Vision + setup (this file)
├── product-mvp.md               # What is shipped today
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
