# AI Resume Reviewer + ATS Scorer

Implements the "AI Resume Intelligence" module from PlacementOS's roadmap: ATS score, resume review, and skill/section extraction.

## Approach

Resume quality is scored using two combined layers rather than a single LLM call:

1. **Deterministic ATS checks** — contact info presence, standard section headers, resume length, and keyword match against a target role. These are fast, free, reproducible, and give a defensible baseline score with no dependency on model output.
2. **LLM qualitative review** (LangChain.js + OpenAI) — generates specific, content-aware suggestions (e.g. "quantify the impact of the bullet under Experience") and flags missing sections the regex checks might not catch.

Keeping the ATS score rule-based, with the LLM layered on top for qualitative feedback, means the score itself is explainable and won't shift between runs, while the improvement suggestions stay flexible and specific to each resume.

## Structure

```
backend/
  routes/resumeAnalyze.js   - POST /api/resume/analyze
  services/resumeParser.js  - PDF/DOCX text extraction
  services/atsChecker.js    - deterministic scoring
  services/llmAnalyzer.js   - LangChain + OpenAI qualitative review
frontend/
  components/ResumeAnalyzer.tsx - upload UI + results display
```

No database is used — the endpoint is stateless; each request is analyzed and returned without persistence.

## Running locally

```
cd backend
npm install
cp .env.example .env   # add your OPENAI_API_KEY
npm start
```

`POST /api/resume/analyze` with a multipart form field `resume` (PDF or DOCX) and optional `targetRole` string.

## Edge cases handled

- Unsupported file types → 415 with a clear message
- Empty/unreadable resumes → 422
- Malformed LLM JSON output → automatic retry, then a graceful fallback response so the ATS score still returns
- File size capped at 5MB via multer

## Integrating into PlacementOS

Mount `backend/routes/resumeAnalyze.js` onto the existing PlacementOS Express app under `/api/resume`, and drop `ResumeAnalyzer.tsx` into the Student Portal's Resume Builder section.
