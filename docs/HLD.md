# PlacementOS — High Level Design (HLD)

## 1. System Overview
**PlacementOS** is an open-source, AI-powered campus placement operating system that bridges students, university placement cells, and corporate recruiters into a unified, transparent, data-driven ecosystem.

---

## 2. High-Level Architecture (HLD)

```
                                  CLIENT TIER
        ┌─────────────────────────────────────────────────────────────┐
        │                 React 18 + Vite SPA Client                  │
        │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
        │  │ Student Portal │ │ Placement Cell │ │ Recruiter Hub  │  │
        │  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘  │
        │          │                  │                  │            │
        │          └──────────────────┼──────────────────┘            │
        │                             │ HTTPS / JSON                  │
        └─────────────────────────────┼───────────────────────────────┘
                                      ▼
                                GATEWAY TIER
        ┌─────────────────────────────────────────────────────────────┐
        │                  Node.js / Express Gateway                  │
        │  - Helmet (HTTP Security Headers)                           │
        │  - In-Memory Sliding Window Rate Limiter (X-RateLimit-*)    │
        │  - Structured Logging (Pino / Pino-Pretty)                  │
        │  - Prometheus Observability Exporter (/metrics)             │
        │  - Joi Schema Request Validation Middleware                 │
        │  - Stateless JWT Authentication + RBAC Engine               │
        │  - Centralized Error & Exception Interceptor                │
        └─────────────────────────────┬───────────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
        APPLICATION SERVICES                       ASYNCHRONOUS QUEUES
  ┌──────────────────────────────┐          ┌──────────────────────────────┐
  │ - Auth Service (JWT/Bcrypt)  │          │ BullMQ + Redis Job Queue     │
  │ - Job & Application Workflow │          │ - Background Resume ATS      │
  │ - Campus Drive Coordinator   │          │ - Email / Broadcast alerts   │
  │ - Analytics & Salary Engine  │          └──────────────┬───────────────┘
  │ - Gemini 1.5 Flash AI Service│                         │
  └──────────────┬───────────────┘                         ▼
                 │                                  WORKER CLUSTER
                 │                          ┌──────────────────────────────┐
                 │                          │ BullMQ Concurrent Workers    │
                 │                          │ (Concurrency: 4, Auto-Retry) │
                 │                          └──────────────┬───────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
                               PERSISTENCE TIER
        ┌─────────────────────────────────────────────────────────────┐
        │                      Prisma ORM Layer                       │
        │                             │                               │
        │                             ▼                               │
        │           Neon PostgreSQL Cloud Database (Serverless)       │
        │       Auto-pooling + Distributed Read/Write Replicas        │
        └─────────────────────────────────────────────────────────────┘
```

---

## 3. High Level Architectural Concepts Applied

### 3.1 Asynchronous Background Processing (Producer-Consumer Pattern)
- **BullMQ + Redis**: Heavy AI resume processing and broadcast communications are offloaded to background job queues.
- **Decoupled API Responsiveness**: HTTP endpoints return immediate response tokens while workers execute in the background with exponential backoff retries.

### 3.2 Full-Stack Observability & Metrics
- **Prometheus Metric Collection**: Endpoints instrumented with `prom-client` exposing latency histograms (`placementos_http_request_duration_seconds`), active gauges, and application counters at `/metrics`.
- **Structured JSON Logging**: Powered by `pino` for low-overhead production tracing with millisecond duration benchmarks and client IP resolution.

### 3.3 Multi-Tier Security (Defense in Depth)
1. **Layer 1**: Helmet security headers (CSP, XSS filter, Frameguard).
2. **Layer 2**: Sliding-window IP rate limiting with standard reset headers.
3. **Layer 3**: Joi strict schema validation (type checking & sanitization).
4. **Layer 4**: Stateless JWT Bearer Token verification with role permissions.
5. **Layer 5**: Parameterized SQL queries via Prisma ORM (SQL-injection immunity).

### 3.4 High Availability & Reliability
- **Graceful Shutdown**: `SIGTERM` and `SIGINT` interceptors closing HTTP server connections, flushing worker queues, and disconnecting database pools safely.
- **Offline Fallback Engine**: If Redis is offline, job processors automatically execute in direct async mode without crashing.
