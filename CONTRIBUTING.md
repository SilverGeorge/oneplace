# Contributing Guide

## Prerequisites

- Node.js 20+
- npm
- Docker (optional, for containerized local setup)

## Local Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Apply database migrations:

```bash
npx prisma migrate dev
```

4. Seed sample data:

```bash
npm run prisma:seed
```

5. Start development server:

```bash
npm run dev
```

## Code Quality Rules

- Use TypeScript strict mode.
- Keep components small and reusable.
- Validate all API inputs with Zod.
- Use `createApiHandler` for consistent API errors/logging.
- Do not commit secrets or `.env`.

## Commit Workflow

- Pre-commit hook runs `lint-staged`.
- Staged files are auto-formatted and linted before commit.

Recommended before opening PR:

```bash
npm run verify
```

## Branch and PR Conventions

- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`
- PR should include:
  - context/goal
  - implementation notes
  - test evidence (screenshots/logs)

## Testing

Run unit tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```
