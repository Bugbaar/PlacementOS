# PlacementOS MVP architecture

## Scope

This MVP implements one complete student journey: explore as a guest, sign in for a personal eligibility decision, apply, and track the outcome. It intentionally does not attempt every module in the long-term PlacementOS vision.

## Request flow

```text
Guest explorer / React dashboard
      |
Redux async actions
      |
REST API (Express + Zod)
      |
Dashboard service ---- Eligibility engine
      |                       |
In-memory store          Pure domain rules
```

## Design decisions

### Explainable eligibility

`evaluateEligibility` is a pure function. Given a student and a drive, it returns every evaluated rule, whether it passed, and a human-readable reason. Routes and UI consume the same result, preventing conflicting decisions.

Skills are shown as matched or missing but are not hard eligibility rules. Recruiters can therefore communicate useful preparation gaps without silently blocking qualified students.

### API validation

Zod schemas validate profile and application mutations at the HTTP boundary. Invalid CGPA values, graduation years, statuses, and unexpected profile fields are rejected before reaching the store.

### Replaceable persistence

The current `PlacementStore` keeps seeded data in memory so contributors can run the product immediately. It owns all persistence operations behind a small interface-like class. A MongoDB/Mongoose adapter can replace it without moving eligibility logic or changing the frontend API contract.

### Frontend state

Redux Toolkit owns server-backed dashboard state and async actions. Component state is limited to presentation details such as filters and expanded eligibility explanations.

### Guest boundary

`GET /api/drives/public` returns only public opportunity and requirement data. Student profiles, personal eligibility decisions, and applications are loaded only after sign-in. This keeps the platform useful before registration without pretending that a generic guest has a personalized match.

Guest actions that require identity—checking eligibility, saving, applying, or tracking—lead to the same focused sign-in step. Deadline calendar export remains public because it contains only opportunity data.

### Evaluation identity

The sign-in screen retrieves seeded preview accounts and validates the shared evaluation password through the API. The selected student ID is stored in a local browser session and scopes dashboard, application, profile, notification, analytics, and settings data. This removes the previous hard-coded-user assumption while keeping the evaluation setup simple.

This is not presented as production authentication. JWT/OAuth, protected student routes, password hashing, and server-managed sessions remain required before deployment.

## Reliability cases covered

- Minimum CGPA and maximum backlog boundaries are inclusive.
- Branch comparisons are case-insensitive.
- Every failed rule is returned in one decision.
- Ineligible applications receive HTTP 422.
- Repeated application requests are idempotent.
- Unknown resources and invalid payloads return explicit errors.
- The UI surfaces API failures and disables actions while mutations run.
- Account switching clears Redux state before loading the next student.
- Settings are namespaced per student in browser storage.
- Public browsing never exposes student or application records.
- Calendar and CSV exports are generated locally, so no personal export is uploaded elsewhere.

## Next production steps

1. Add JWT/OAuth authentication and derive the student ID from the session.
2. Replace the in-memory store with MongoDB repositories.
3. Add placement-cell drive creation and recruiter moderation.
4. Add audit history for profile and application changes.
5. Send deadline and status notifications asynchronously.
