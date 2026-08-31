# PlacementOS Student Placement Intelligence MVP

## Overview

This PR implements an initial student-focused MVP for PlacementOS, transforming the conceptual vision into a fully functional, open-source application.

## What This PR Adds

- **Student Profile Management**: Create and manage skills, preferences, and academic details.
- **Placement Opportunity Management**: Discovery interface for available roles.
- **Eligibility Engine**: Hard-constraint checking for CGPA, branch, and graduation year.
- **Explainable Matching Engine**: Deterministic algorithm matching student profiles to job requirements.
- **Skill-Gap Analysis**: Highlights missing skills for specific opportunities.
- **Personalized Recommendations**: Intelligent ranking of opportunities.
- **Placement Readiness Score**: Rule-based calculation of student preparedness.
- **Application Tracking**: Kanban-style status management for applications.
- **Optional AI Career Assistant**: Fallback-supported AI career guidance.
- **REST APIs**: Complete backend routing and controller logic.
- **Automated Tests**: Vitest suite for core business logic.
- **Documentation**: Architecture, API, and matching logic details.
- **Docker Development Setup**: Easy `docker-compose` orchestration.
- **CI Workflow**: GitHub Actions for testing and linting.

## Product Approach

Instead of attempting to implement shallow interfaces for every PlacementOS module at once, this contribution focuses on delivering one complete, high-quality student placement journey. This establishes the foundational data models and architecture upon which the Recruiter and University portals can be built.

## Architecture

```text
React (Frontend)
       ↓ (Axios)
REST API (Express)
       ↓ (Zod)
Controllers (HTTP)
       ↓
Services (Business Logic)
       ↓
Mongoose / MongoDB
```

## Matching Algorithm

The engine uses a deterministic, weighted scoring model:
- Technical Skill Match (60%)
- Academic Match (20%)
- Role Preference (10%)
- Location Preference (10%)

*(See `docs/matching-engine.md` for full details)*

## Testing

- Unit tests written for `eligibilityService` and `matchingService` using Vitest.
- Ran frontend and backend builds locally.
- Verified Docker compose setup.

## Screenshots

*(Add screenshots here after manual capture)*
- Dashboard
- Opportunity Details (Showing explainable match)
- Profile Editor
- Application Tracker

## Future Work

- Placement Cell Dashboard
- Recruiter Portal
- Resume Intelligence
- Interview Scheduling
- Analytics
- Communication Hub
- Advanced AI integrations
- Authentication/OAuth
