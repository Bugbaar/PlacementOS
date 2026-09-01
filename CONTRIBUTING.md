# Contributing to PlacementOS

First off, thank you for considering contributing to PlacementOS! 🎉

PlacementOS is an open-source project and every contribution — code, docs, bug reports, feature ideas — makes a difference for students worldwide.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building this for students — let's keep the community welcoming.

## How Can I Contribute?

### 1. Reporting Bugs
- Use the [GitHub Issues](../../issues) page
- Include steps to reproduce, expected vs actual behavior
- Add screenshots/logs if relevant
- Tag with `bug` label

### 2. Suggesting Features
- Open an issue with the `enhancement` label
- Describe the use case and benefit
- Discuss implementation approach before coding

### 3. Your First Code Contribution
Look for issues tagged `good-first-issue` — these are scoped and welcoming to newcomers.

### 4. Pull Requests
- Fork the repo
- Create a feature branch from `main`
- Make focused, atomic commits
- Add tests for new functionality
- Update documentation
- Run `npm test` before submitting
- Open a PR with a clear description

## Development Workflow

### Setup
```bash
# Fork & clone
git clone https://github.com/YOUR-USERNAME/PlacementOS.git
cd PlacementOS
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### Running Locally
```bash
npm run dev          # Development with nodemon
npm test             # Run test suite
npm run test:watch   # Watch mode
npm run lint         # Lint (if configured)
```

### Branch Naming
- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation
- `refactor/short-description` — refactoring
- `test/short-description` — test additions

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add parent advisor dashboard
fix: resolve OFFER_EXTENDED status bug
docs: update API.md with new endpoints
refactor: extract service layer from controllers
test: add jest tests for auth module
```

### Code Style
- ESM modules (`import`/`export`)
- 2-space indentation
- Use `asyncHandler` for all async route handlers
- Validate input with Joi schemas
- Throw `ApiError` for expected errors
- Return `ApiResponse` for success responses
- Log with structured Pino logger

### Project Structure
```
server/src/
├── controllers/   # HTTP route handlers (thin)
├── services/      # Business logic (planned)
├── repositories/  # DB access (planned)
├── middleware/    # Express middlewares
├── routes/        # Route definitions
├── queue/         # BullMQ workers
├── utils/         # Helpers (logger, validator, etc.)
└── config/        # App configuration
```

### Before Submitting a PR
- [ ] Code follows existing style
- [ ] Tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.logs left behind
- [ ] No sensitive data in commits

## Reporting Security Issues

**Do not** open public issues for security vulnerabilities. Email `security@bugbaar.com` instead.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).
