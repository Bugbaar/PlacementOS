# PlacementOS — Low Level Design (LLD)

## 1. Data Models & Entity Relationship Diagram (ERD)

```
 [User] (1) ─────────── (0..1) [Student] (1) ─────── (0..N) [Application] (N) ── (1) [Job]
   │                                  │
   │ (1)                              │ (1)
   ▼ (0..1)                           ▼ (0..N)
 [Company] (1) ── (0..N) [Job]       [Resume]
   │
   ▼ (0..N)
 [PlacementDrive]
```

---

## 2. Detailed Schema Definitions

### 2.1 User Entity (`users`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | PK, CUID | Unique identifier |
| `email` | `String` | UNIQUE, NOT NULL | Account email |
| `password` | `String` | NOT NULL | Bcrypt hash |
| `name` | `String` | NOT NULL | Full name |
| `role` | `Enum (Role)` | DEFAULT 'STUDENT' | STUDENT, RECRUITER, PLACEMENT_CELL, ADMIN |
| `avatar` | `String?` | NULLABLE | Profile picture URL |
| `isVerified`| `Boolean` | DEFAULT false | Email verification flag |
| `createdAt` | `DateTime` | DEFAULT now() | Timestamp |

### 2.2 Student Profile Entity (`students`)
| Column | Type | Description |
|---|---|---|
| `id` | `String (PK)` | Student profile primary key |
| `userId` | `String (FK)` | One-to-one mapping to `users.id` (Cascade) |
| `college` | `String?` | Enrolled institution |
| `branch` | `String?` | Major (e.g. "Computer Science") |
| `cgpa` | `Float?` | Academic score |
| `batch` | `String?` | Graduation year (e.g. "2025") |
| `skills` | `String[]` | Array of technical tags |
| `isPlaced` | `Boolean` | Automated placement status flag |

### 2.3 Application State Machine
```
[APPLIED] ──► [UNDER_REVIEW] ──► [SHORTLISTED] ──► [INTERVIEW] ──► [SELECTED]
    │                 │                 │               │               │
    ▼                 ▼                 ▼               ▼               ▼
[WITHDRAWN]       [REJECTED]        [REJECTED]      [REJECTED]    (Marks student placed)
```

---

## 3. Design Patterns Applied

1. **Singleton Pattern**: PrismaClient database connection pool.
2. **Factory / Strategy Pattern**: AI Analysis provider fallback mechanism (`GeminiService` with heuristic strategy fallback).
3. **Middleware Chain Pattern**: Express Request Pipeline (`rateLimiter` -> `cors` -> `authenticate` -> `authorize(roles)` -> `controller` -> `errorHandler`).
4. **Repository / ORM Pattern**: Prisma data access abstractions preventing direct SQL coupling.
