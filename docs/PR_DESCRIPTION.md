# feat: AI Resume-JD Fit Scorer (Resume Intelligence module)

## What

Implements a resume ↔ job description fit scorer: upload a resume PDF and a job
description, get back a skill match percentage, matched/missing skills, and the resume
bullets most relevant to that JD.

This is a scoped slice of two modules already named in the PlacementOS README:
- **AI Resume Intelligence**: ATS Score, Skill Extraction
- **AI Placement Assistant**: Skill Recommendations, Resume Feedback

Full writeup of scope and architecture decisions in `docs/resume-fit-module.md`.

## Why this slice

Rather than scaffolding broad, shallow structure across every module in the README, I
picked one feature I could build to a real depth: correct edge-case handling, tests, and
a working UI, not just a route that returns mock data.

## Stack

Matches the stack already specified in this repo's README: Node.js, Express, MongoDB,
Mongoose on the backend; React, TypeScript, Tailwind on the frontend.

## Key design decisions

- Skill matching uses fuzzy string matching (Levenshtein distance + alias normalization),
  not embeddings, since skill-name variance is a spelling problem, not a semantic one.
- Resume-bullet relevance ranking uses embeddings + cosine similarity, since that
  comparison (a JD line vs. a resume bullet) does need semantic similarity.
- Both the LLM extraction and embedding steps have a deterministic offline fallback that
  activates automatically when `GEMINI_API_KEY` isn't set, so `npm test` and local dev
  work out of the box for any reviewer, with zero setup.
- Persistence to MongoDB is best-effort: if `MONGODB_URI` isn't configured, the endpoint
  still returns the analysis rather than failing the request.

## Testing

21 tests, all passing: unit tests for skill matching, embedding/cosine-similarity math,
and bullet ranking, plus API-level tests covering the happy path and edge cases (missing
file, JD too short, non-PDF upload, unparseable/empty PDF).

```
Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

## What's out of scope here (and why)

- Auth on this route: PlacementOS doesn't have its auth system built yet either, so
  adding a placeholder here would be dead code.
- A history/dashboard view of past analyses: the `ResumeFitResult` model already supports
  one, left for a focused follow-up PR.
- Redux Toolkit on the frontend: this page has two pieces of local state; a store would
  be over-engineering at this scope.

## How to run

See `docs/resume-fit-module.md` for backend/frontend run instructions.

---

Discussion comment: [link to your "I am working on it" comment here]
