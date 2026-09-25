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
  (`HeuristicExtractionProvider`, `HashingEmbeddingProvider`) used automatically when no
  LLM API key is set. Extraction auto-picks Groq → OpenAI → Anthropic → Gemini, or
  `RESUME_FIT_PROVIDER`. Embeddings use Gemini when `GEMINI_API_KEY` is set, else hashing.
  `npm test` and local dev work without any key.
- **Persistence is best-effort.** If Mongo isn't connected, the endpoint still
  returns a full analysis; only the "save this result" side-effect is skipped.

## What's deliberately out of scope

- A dashboard or history view of past analyses (the model to support one, `ResumeFitResult`,
  is already in place for a follow-up PR).
- Redux Toolkit on the frontend (this is one page with two pieces of local state; adding a
  store would be over-engineering for the current scope).

## Auth

`POST /api/resume-fit` requires a JWT (`Authorization: Bearer …`), same as the assistant
and other student features.

## Running it

Backend:
```bash
cd backend
cp .env.example .env
npm install
npm test
npm run dev      # http://localhost:5000
```

Frontend:
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

## Known follow-ups

- History UI for past `ResumeFitResult` rows.
- Stronger PDF text fixtures for end-to-end skill-match assertions.
- No rate limiting yet (Calibrate, a related project, rate-limits this kind of endpoint;
  worth carrying that pattern over in a follow-up).
