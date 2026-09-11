# AI Resume-JD Fit Scorer

Contribution to PlacementOS's **AI Resume Intelligence** and **AI Placement Assistant**
modules, built for Bugbaar Internship Round 1.

## What this is

A single, well-scoped vertical slice: upload a resume (PDF) and paste a job description,
get back a skill match score, matched/missing skills, and the resume bullets most relevant
to that specific JD.

Maps to the roadmap items already named in PlacementOS's README:

| PlacementOS roadmap item      | Delivered here                                             |
|--------------------------------|-------------------------------------------------------------|
| AI Resume Intelligence → ATS Score | `matchPercentage` in the API response                  |
| AI Resume Intelligence → Skill Extraction | LLM-backed extraction of skills from resume/JD text |
| AI Placement Assistant → Skill Recommendations | `missingSkills` in the API response          |
| AI Placement Assistant → Resume Feedback | `topRelevantBullets`, the bullets worth emphasizing for this JD |

## Architecture decisions (and why)

- **Skill matching is fuzzy string matching (Levenshtein), not embeddings.** Skill names
  are short and mostly single tokens with formatting variance ("node.js" vs "nodejs" vs
  "Node"). That's a spelling problem, not a semantic one. A small alias dictionary plus
  edit-distance matching is deterministic, cheap, and easy to unit test.
- **Bullet relevance ranking is embeddings + cosine similarity.** A JD line and a resume
  bullet describing the same thing rarely share exact wording, so this half of the module
  needs semantic similarity, which is where embeddings earn their cost.
- **Both the LLM extraction step and the embedding step have an offline fallback**
  (`HeuristicExtractionProvider`, `HashingEmbeddingProvider`) used automatically when
  `GEMINI_API_KEY` is not set. This means `npm test` and local dev work immediately for
  anyone who clones the repo, with no API key setup required before they can even see the
  feature run. Set `GEMINI_API_KEY` to switch to the real Gemini-backed implementations.
- **Persistence is best-effort.** If `MONGODB_URI` isn't configured, the endpoint still
  returns a full analysis instead of failing the request; only the "save this result"
  side-effect is skipped.

## What's deliberately out of scope

- Auth/OAuth on this route (PlacementOS's broader auth system isn't built yet either;
  adding a placeholder here would just be dead code).
- A dashboard or history view of past analyses (the model to support one, `ResumeFitResult`,
  is already in place for a follow-up PR).
- Redux Toolkit on the frontend (this is one page with two pieces of local state; adding a
  store would be over-engineering for the current scope).

## Running it

Backend:
```bash
cd backend
cp .env.example .env
npm install
npm test        # 21 tests, all passing, no API key required
npm run dev      # http://localhost:4000
```

Frontend:
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173, proxies /api to localhost:4000
```

## Known follow-ups

- `multer@1.x` has known CVEs; a real merge should bump to `multer@2.x` (skipped here
  since it changes the API surface slightly and this PR is scoped to the feature, not a
  dependency upgrade).
- No rate limiting yet (Calibrate, a related project, rate-limits this kind of endpoint;
  worth carrying that pattern over in a follow-up).
