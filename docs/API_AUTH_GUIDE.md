# API Authentication Guide

All protected endpoints require a JWT Bearer token in the Authorization header.

## Registration

### Register as Student

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "STUDENT"
  }'
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "cmt...",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "STUDENT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully.",
  "success": true
}
```

### Register as Recruiter

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Corp HR",
    "email": "hr@techcorp.com",
    "password": "securePassword123",
    "role": "RECRUITER"
  }'
```

### Register as Parent/Advisor

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.parent@example.com",
    "password": "securePassword123",
    "role": "PARENT_ADVISOR"
  }'
```

## Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "cmt...",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "STUDENT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful.",
  "success": true
}
```

## Using the Token

Include the token in all protected requests:

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Token Refresh

When your access token expires (7 days), use the refresh token:

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Tokens refreshed successfully.",
  "success": true
}
```

## Example: Student Workflow

### 1. Get Profile

```bash
curl -X GET http://localhost:5000/api/v1/students/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Update Profile

```bash
curl -X PUT http://localhost:5000/api/v1/students/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "college": "IIT Delhi",
    "branch": "Computer Science",
    "cgpa": 8.5,
    "skills": ["JavaScript", "React", "Node.js"],
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }'
```

### 3. Apply to Job

```bash
curl -X POST http://localhost:5000/api/v1/jobs/job-id-here/apply \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coverLetter": "I am excited to apply for this position..."
  }'
```

### 4. Check Application Status

```bash
curl -X GET http://localhost:5000/api/v1/applications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get AI Recommendations

```bash
curl -X GET http://localhost:5000/api/v1/ai/recommended-jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Example: Recruiter Workflow

### 1. Create Company

```bash
curl -X POST http://localhost:5000/api/v1/companies \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Corp",
    "website": "https://techcorp.com",
    "industry": "Software",
    "location": "Bangalore"
  }'
```

### 2. Post a Job

```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "We are looking for a skilled software engineer...",
    "requirements": ["B.Tech CS", "2+ years experience"],
    "skills": ["JavaScript", "React", "Node.js"],
    "salary": "15-25 LPA",
    "location": "Bangalore",
    "type": "FULL_TIME"
  }'
```

### 3. View Applications

```bash
curl -X GET http://localhost:5000/api/v1/applications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Application Status

```bash
curl -X PUT http://localhost:5000/api/v1/applications/app-id-here/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHORTLISTED",
    "notes": "Good profile, schedule interview"
  }'
```

## Example: Parent/Advisor Workflow

### 1. Link Student

```bash
curl -X POST http://localhost:5000/api/v1/parent/link-student \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentEmail": "john@example.com",
    "relation": "Mother"
  }'
```

### 2. View Student Progress

```bash
curl -X GET http://localhost:5000/api/v1/parent/student/student-id/progress \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. View Dashboard

```bash
curl -X GET http://localhost:5000/api/v1/parent/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Error Handling

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. Required role: RECRUITER"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 | 15 minutes |
| Job Operations | 50 | 1 hour |
| General API | 300 | 15 minutes |

## Security Best Practices

1. **Never expose tokens in client-side code**
2. **Store tokens securely (httpOnly cookies)**
3. **Use HTTPS in production**
4. **Rotate JWT secrets regularly**
5. **Monitor for unusual activity**
