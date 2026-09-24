# Resume Versioning

## Overview

Students can keep multiple named resume versions instead of overwriting one file.
Useful when tailoring resumes for different placement opportunities.

**Status:** MVP service is **in-memory** (resets on server restart). Persisted Mongo storage can follow later.

## API (authenticated)

Base path: `/api/students/:studentId/resumes`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List versions for the student |
| `POST` | `/` | Create version `{ name, fileUrl }` |
| `GET` | `/:versionId` | Get one version |
| `POST` | `/:versionId/activate` | Mark version active |
| `DELETE` | `/:versionId` | Delete inactive version |

Access: the student themselves or an admin (`JWT`).

## Version model

- `id` — unique version id (`{studentId}-{n}`)
- `name` — user-defined label
- `version` — sequential number
- `fileUrl` — stored resume location / URL
- `createdAt` — ISO timestamp
- `isActive` — currently selected version

## Code

- Service: `backend/src/services/resumeVersionService.ts`
- Routes: `backend/src/routes/resumeVersionRoutes.ts`
- Tests: `backend/tests/resumeVersion.test.ts` (included in `npm test`)
