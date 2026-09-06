# Contributing to PlacementOS

Thank you for helping make campus placements easier to understand and manage.

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install` from the repository root.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The frontend and API start together. No database or API key is needed for the current MVP.

## Before opening a pull request

Run the complete quality check:

```bash
npm run check
```

Please keep pull requests focused, explain the user problem being solved, and include tests for business rules or critical interactions. UI changes should include desktop and mobile screenshots.

## Project conventions

- Use TypeScript and keep strict type checking enabled.
- Keep eligibility rules in the pure domain engine, not in route handlers or UI components.
- Validate all API input at the server boundary.
- Return clear reasons when an eligibility rule fails.
- Prefer accessible native controls and visible focus states.
- Never commit secrets or generated build output.

## Commit style

Use short, descriptive conventional commits when possible:

- `feat: add drive eligibility explanation`
- `fix: handle CGPA boundary values`
- `test: cover duplicate applications`
- `docs: clarify local setup`

