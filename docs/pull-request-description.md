# Feat: Build PlacementOS AI-Powered Student Intelligence MVP

## Problem
Students navigating placement cycles often receive generic, one-size-fits-all advice that doesn't consider their unique academic backgrounds or specific skill gaps. They need highly personalized, actionable placement guidance tailored to their exact profile and target opportunities.

## Solution
I have implemented a cohesive, end-to-end Student Intelligence MVP for PlacementOS. This includes a fully functional MERN stack platform featuring deterministic matching algorithms and a **real, context-aware AI Placement Assistant** powered by the Groq API. 

The application provides students with deep, explainable insights into their placement readiness, active applications, and skill gaps, while an embedded AI acts as their personalized career coach.

## Technical Approach
The platform is built using modern, open-source-ready tools:
- **Frontend**: React, Vite, TypeScript, Tailwind CSS v4, Redux Toolkit, Lucide-React.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Zod validation, `groq-sdk`, and `express-rate-limit`.
- **Infrastructure**: Fully Dockerized (`docker-compose`) for immediate local orchestration, supported by GitHub Actions CI for automated build and test verification (Vitest).

## AI Architecture
Instead of generic chat interactions, the AI is deeply integrated with the platform's data. 
When a student asks a question, the backend securely fetches their profile, application history, and the system's deterministic recommendations. This data is injected as a structured JSON context payload into the LLM's system prompt. The Groq model then uses this factual context to generate highly personalized, actionable guidance—such as customized 30-day learning plans or interview prep questions—without hallucinating fake opportunities or skills.

## Security
The `GROQ_API_KEY` is completely isolated in the Node.js backend environment. The React frontend never communicates directly with Groq, ensuring the API key is never exposed in browser network payloads, bundled code, or GitHub repositories.

## Deterministic vs AI
To ensure absolute reliability, **eligibility and matching logic remain strictly deterministic.** 
The platform's business logic (`eligibilityService` and `matchingService`) handles hard constraints (CGPA, Branch, Year) and weighted skill-matching to output a concrete Match Score (0-100%). The LLM is expressly forbidden from calculating these scores; instead, it receives the calculated scores in its context window and uses them to *explain* why an opportunity is a good or bad fit using natural language.

---

### Verification
- [x] Application is fully Dockerized and runs seamlessly via `docker-compose`.
- [x] Backend and Frontend both compile and build without warnings (`npm run build`).
- [x] Business logic (Matching Engine & Assistant Context generation) is unit tested and passing (`npm run test`).
- [x] Missing `GROQ_API_KEY` gracefully degrades to a UI fallback warning rather than crashing the application.
- [x] Custom AI endpoints (`/api/assistant/chat`) are protected by IP-based rate limiting to prevent abuse.

*See `docs/ai-placement-assistant.md` and `docs/architecture.md` for a deeper dive into the system design.*
