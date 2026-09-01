# Eligibility Engine API

Base URL: `http://localhost:5000`

## Auth

`POST /api/auth/login`

```json
{ "email": "tpo@placementos.dev", "password": "Placement@2026" }
```

Send `Authorization: Bearer <token>` on remaining routes.

## Upload

`POST /api/uploads/students` — multipart field `file` (CSV).

Expected columns: `rollNumber,name,email,branch,cgpa,activeBacklogs,skills,tenthPercent,twelfthPercent`. Skills may be `|` or `;` separated.

## Run engine

`POST /api/engine/run`

```json
{
  "batchId": "<id>",
  "criteria": {
    "companyName": "Nimbus Systems",
    "driveName": "SDE Intern 2026",
    "minCgpa": 8,
    "maxActiveBacklogs": 0,
    "requiredSkills": ["Node.js"],
    "skillMatchMode": "all",
    "allowedBranches": ["CSE", "IT"]
  }
}
```

## Export

- `GET /api/engine/runs/:id/export.csv?mode=shortlisted|audit`
- `GET /api/engine/runs/:id/export.pdf`
- `GET /api/engine/notifications?runId=`
