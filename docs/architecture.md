# Eligibility engine architecture

1. Placement officer authenticates with JWT.
2. CSV is parsed into a typed student array (`Map`/`Set` lookups for duplicates and skills).
3. Criteria are applied in `eligibilityEngine.ts` (CGPA, backlogs, branch set, skill intersection).
4. Results persist in MongoDB when available, otherwise an in-memory store.
5. Mock email / WhatsApp / in-app notification logs are written for shortlisted students.
6. Socket.IO broadcasts `engine:complete` for live dashboard metrics.
7. CSV and PDF exporters stream downloadable shortlists.
