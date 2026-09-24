# Contributing to PlacementOS

We welcome contributions! Please follow these guidelines to get started.

## Prerequisites
- Node.js (v18 or v20)
- MongoDB (running locally or via Docker)
- Docker Desktop (optional, for easy setup)

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Bugbaar/PlacementOS.git
cd PlacementOS
```

### 2. Setup Database
If you have Docker, you can start just the database:
```bash
docker-compose up -d mongodb
```

### 3. Run Backend
```bash
cd backend
npm install
npm run dev
```
The backend runs on `http://localhost:5000`.

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:5173`.

### 5. Seed Data (Important!)
To populate the database with a demo student and opportunities:
```bash
cd backend
npm run seed
```

## Running Tests
```bash
cd backend
npm run test
```

## Running Lint
```bash
cd backend
npm run lint
```

## Commit Conventions
We use [Conventional Commits](https://www.conventionalcommits.org/).
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance

## Pull Request Process
1. Create a feature branch (`git checkout -b feat/your-feature`)
2. Commit your changes
3. Push to your fork and submit a PR
4. Ensure all CI checks pass
