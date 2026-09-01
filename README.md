# PlacementOS

> **Open-Source AI-Powered Campus Placement Operating System**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-4.21.0-lightgrey.svg)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.9.0-blueviolet.svg)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://postgresql.org)
[![AI](https://img.shields.io/badge/Google-Gemini-4285F4.svg)](https://deepmind.google/technologies/gemini/)

**Built by [Bugbaar Global Community](https://github.com/Bugbaar)** — Empowering Students. Modernizing Placements. Creating Opportunities.

> 🔗 **Repository:** https://github.com/Bugbaar/PlacementOS

---

## Overview

PlacementOS modernizes campus placements by uniting **Students**, **University Placement Cells**, **Recruiters**, and **Parent Advisors** onto a single intelligent, data-driven platform.

> **Mission:** Make placements transparent, data-driven, AI-powered, and accessible to every student.

---

## Features & Modules

### 1. Student Portal
- Profile & Portfolio (CGPA, skills, branch, GitHub, LinkedIn)
- Real-time Application Tracker (`Applied` → `Shortlisted` → `Interview` → `Selected`)
- **AI Resume ATS Intelligence** — Instant 0-100 score, skill extraction, strengths, improvements
- **AI Placement Coach** — Interactive mentor for DSA, interview prep, career roadmaps
- **Plagiarism Detection** — Jaccard + Cosine similarity scoring
- **Placement Readiness Score** — 4-factor algorithm

### 2. Placement Cell Dashboard
- Campus Drive Manager (multi-round scheduling)
- Eligibility Engine (CGPA + branch validation)
- Real-time Placement Analytics
- Branch-wise and Salary Analytics
- Announcement & Bulk Communication

### 3. Recruiter Hub
- Job posting & lifecycle management
- Candidate pipeline with AI-extracted scores
- Interview scheduling & offer management
- Company reviews + sentiment analysis
- External job imports (LinkedIn, Indeed)

### 4. Parent Advisor Portal
- Link multiple students
- View application progress
- Dashboard with placement stats
- Privacy-respecting access controls

### 5. AI & Communication
- **Notifications** with email delivery
- **Sentry** error monitoring
- **BullMQ + Redis** for background jobs
- **Prometheus** metrics + Pino structured logs
- **Google OAuth 2.0** authentication
- **Cloudinary** for resume file storage
- **Nodemailer** for transactional email

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + Vite + Redux Toolkit             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js / Express API Gateway                   │
│   Helmet · CORS · Rate Limit · JWT · OAuth · Sentry         │
└──────────┬──────────────────┬──────────────────┬───────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌────────────┐     ┌────────────┐     ┌────────────┐
    │ PostgreSQL │     │   Redis    │     │  External  │
    │  (Prisma)  │     │  + BullMQ  │     │  Services  │
    └────────────┘     │  Queues    │     │ - Gemini   │
                       └────────────┘     │ - Cloudinary│
                                         │ - SMTP     │
                                         └────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ (ESM modules) |
| Framework | Express 4.21 + Helmet + Compression |
| Database | PostgreSQL 15+ (via Prisma 6 ORM) |
| Cache / Queue | Redis 7+ (via ioredis + BullMQ) |
| Auth | JWT (access + refresh) + Google OAuth 2.0 |
| AI | Google Gemini 1.5 Flash |
| Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| Monitoring | Prometheus + Pino + Sentry |
| Testing | Jest + Supertest |
| DevOps | Docker + Docker Compose + GitHub Actions |

---

## Project Structure

```
PlacementOS/
├── server/                       # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/              # DB, app config
│   │   ├── controllers/         # 17 route handlers
│   │   ├── middleware/          # auth, error, rateLimit, security
│   │   ├── queue/               # BullMQ queues (resume, notification)
│   │   ├── routes/              # 15 route modules
│   │   ├── services/            # gemini, email, cloudinary
│   │   ├── utils/               # logger, metrics, validator, constants
│   │   ├── app.js               # Express app
│   │   └── index.js             # Server entry
│   ├── prisma/
│   │   ├── schema.prisma        # 12 models, 7 enums
│   │   └── seed.js              # Demo data
│   ├── tests/                   # Jest test suite
│   ├── Dockerfile
│   └── package.json
├── docs/                         # Architecture & API docs
│   ├── HLD.md                   # High-Level Design
│   ├── LLD.md                   # Low-Level Design
│   ├── API.md                   # REST API reference
│   ├── API_AUTH_GUIDE.md
│   └── SETUP_GUIDE.md
├── docker-compose.yml           # One-command dev stack
├── .github/workflows/ci.yml     # CI pipeline
└── README.md
```

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone
git clone https://github.com/Bugbaar/PlacementOS.git
cd PlacementOS

# Start everything
docker-compose up -d

# Server available at http://localhost:5000
```

### Option 2: Local Development

**Prerequisites:** Node.js 20+, PostgreSQL 15+, Redis 7+

```bash
cd server

# Install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DB/Redis/API keys

# Database setup
npx prisma migrate deploy
npx prisma generate
npm run db:seed

# Run
npm run dev
```

---

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

| Module | Endpoints |
|---|---|
| **Auth** | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/google` |
| **Students** | `/students/profile`, `/students/dashboard/stats` |
| **Jobs** | `/jobs`, `/jobs/my-jobs`, `/jobs/:id/apply` |
| **Applications** | `/applications`, `/applications/:id/status`, `/applications/job/:jobId` |
| **Companies** | `/companies`, `/companies/my`, `/companies/:id` |
| **Drives** | `/drives`, `/drives/:id`, `/drives/:id/register` |
| **Resume** | `/resume/analyze`, `/resume/history` |
| **AI** | `/ai/chat`, `/ai/interview-prep`, `/ai/readiness-score`, `/ai/recommended-jobs` |
| **Analytics** | `/analytics/overview`, `/analytics/branch-distribution`, `/analytics/salary-metrics` |
| **Announcements** | `/announcements` |
| **Notifications** | `/notifications`, `/notifications/:id/read` |
| **Reviews** | `/reviews`, `/reviews/company/:id`, `/reviews/company/:id/sentiment` |
| **Plagiarism** | `/plagiarism/check`, `/plagiarism/stats` |
| **Recommendations** | `/recommendations/collaborative`, `/recommendations/trending` |
| **External Jobs** | `/external-jobs`, `/external-jobs/import/linkedin` |
| **Parent** | `/parent/profile`, `/parent/link-student`, `/parent/student/:id/progress` |

Full reference: [`docs/API.md`](./docs/API.md)

---

## Environment Variables

Create `server/.env`:

```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/placementos
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Recommended
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://127.0.0.1:6379
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENTRY_DSN=...
```

See `server/.env.example` for full list.

---

## Testing

```bash
cd server
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## Deployment

```bash
# Build production image
docker build -t placementos-api ./server

# Run
docker run -p 5000:5000 --env-file server/.env placementos-api
```

For full production deployment with DB + Redis, use `docker-compose.yml`.

---

## Design Patterns & Architecture

### Applied LLD Patterns
- **Singleton** — Prisma client, Logger, Config
- **Factory** — (planned for AI providers)
- **Strategy** — Heuristic fallback in Gemini service
- **Middleware Chain** — 10+ Express middlewares
- **Higher-Order Function** — `asyncHandler`, `createRateLimiter`
- **Repository (via Prisma)** — Database abstraction
- **Decorator** — `authenticate`, `authorize`, `validateBody`
- **Chain of Responsibility** — Express middleware

### Applied HLD Concepts
- **Layered Architecture** — Routes → Controllers → Services → Prisma
- **API Gateway** — Centralized middleware pipeline
- **Message Queue** — BullMQ + Redis for async jobs
- **Producer-Consumer** — API enqueues, worker processes
- **Cache-Aside** — (Redis cache layer — ready)
- **Graceful Degradation** — Queue fallback to direct execution
- **Observability** — Prometheus + Pino + Sentry
- **Health Checks** — `/health` + `/health/detailed`
- **Graceful Shutdown** — SIGTERM/SIGINT with cleanup
- **Defense in Depth** — Helmet + CORS + Rate Limit + Auth + Validation

### SOLID Principles
- **S** — Single Responsibility (one controller per resource)
- **O** — Open/Closed (new routes added without touching app)
- **L** — Liskov Substitution (all controllers interchangeable)
- **I** — Interface Segregation (auth + authorize separate)
- **D** — Dependency Inversion (controllers depend on Prisma abstraction)

Full architecture: [`docs/HLD.md`](./docs/HLD.md) and [`docs/LLD.md`](./docs/LLD.md)

---

## Contributing

We welcome contributors! See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines.

**Good first issues** are tagged with `good-first-issue`. Look for areas marked:
- `documentation` — API docs, code comments
- `help-wanted` — features needing help
- `bug` — confirmed bugs
- `enhancement` — new features

### Development Setup
1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make changes + add tests
4. Run `npm test` and `npm run lint`
5. Commit with conventional commits
6. Push and open a PR

---

## Roadmap

- [x] Core placement flow (Students, Recruiters, Drives)
- [x] AI Resume ATS + Career Coach
- [x] Real-time notifications + email
- [x] Google OAuth
- [x] Cloudinary file storage
- [x] Parent Advisor portal
- [x] Company reviews + sentiment analysis
- [x] Plagiarism detection
- [x] Collaborative job recommendations
- [x] External job imports
- [x] Docker + CI/CD
- [ ] Socket.IO real-time
- [ ] WhatsApp Business API
- [ ] Mobile app (React Native)
- [ ] Discussion forums
- [ ] Resume builder UI
- [ ] Placement trends (time-series analytics)

---

## License

MIT © [Bugbaar Global Community](https://github.com/Bugbaar)

---

## Community

- **GitHub**: [Bugbaar/PlacementOS](https://github.com/Bugbaar/PlacementOS)
- **Issues**: [Report a bug](https://github.com/Bugbaar/PlacementOS/issues)
- **Discussions**: [Join the conversation](https://github.com/Bugbaar/PlacementOS/discussions)

---

**Built with ❤️ for students worldwide.**
