# Product Decisions

## Why focus on the student journey?
To create a cohesive MVP, it was necessary to build one complete vertical slice of the product rather than building shallow interfaces for every user persona (Student, Recruiter, University). The core value proposition of PlacementOS starts with connecting students to opportunities intelligently. By building the student profile, matching engine, and application tracker, we lay the foundation for all other modules.

## Deterministic Matching Engine
Instead of relying on a black-box machine learning model for the MVP, we implemented a deterministic rule-based matching engine. 
**Why?**
1. **Explainability**: Students can see exactly *why* they matched and what skills they are missing.
2. **Reliability**: Hard constraints (CGPA, Branch) are guaranteed to be respected.
3. **Testability**: The scoring logic can be unit-tested effectively.

## Optional AI Assistant
The AI Career Assistant is built with an interface `aiService.ts` that provides deterministic fallback responses if no external AI API key is present.
**Why?**
This ensures the repository can be cloned, run, and evaluated by any contributor or evaluator without requiring them to set up paid API accounts (like OpenAI or Groq) just to see the application work.

## Modular Backend Architecture
The backend uses a Service-Controller-Route architecture.
**Why?**
It separates business logic from HTTP routing. If PlacementOS eventually introduces a GraphQL API or a message queue for heavy processing, the core services (like `matchingService` or `skillGapService`) can be reused without modification.
