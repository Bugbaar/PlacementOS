# Contributing to PlacementOS

Thank you for helping build an open-source placement operating system.

## Local setup

1. Clone the repository.
2. Copy `backend/.env.example` to `backend/.env`.
3. Start MongoDB (Docker: `docker compose up mongo -d`) or let the API fall back to in-memory storage.
4. From `backend/`: `npm install` then `npm run dev`.
5. From `frontend/`: `npm install` then `npm run dev`.

## Guidelines

- Keep eligibility logic in `backend/src/services` so rules stay testable.
- Prefer TypeScript, Tailwind utility classes, and Redux Toolkit for client state.
- Match the dark obsidian design system (`#09090B` / `#18181B`, blue–purple accent).
- Open a pull request with a short summary of what changed and how to verify it.
