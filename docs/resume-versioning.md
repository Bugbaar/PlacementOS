# Resume Versioning

## Overview

Resume Versioning allows students to maintain multiple versions of their resume
instead of overwriting an existing resume.

This is useful when students tailor their resume for different placement
opportunities.

## Goals

- Keep previous resume versions available.
- Give each version a meaningful name.
- Record when a version was created.
- Allow users to identify the version used for a particular opportunity.
- Prevent accidental loss of an older resume version.

## Proposed Version Model

Each resume version should contain:

- `id` — unique version identifier
- `name` — user-defined version name
- `version` — sequential version number
- `fileUrl` — stored resume location
- `createdAt` — creation timestamp
- `isActive` — whether this is the currently selected version

Example:

```json
{
  "id": "resume-001",
  "name": "Java Developer Resume",
  "version": 2,
  "fileUrl": "/resumes/java-developer-v2.pdf",
  "createdAt": "2026-09-10T10:00:00Z",
  "isActive": true
}
