# One Place SaaS

Production-oriented Next.js SaaS starter with TypeScript, Tailwind CSS, Prisma/PostgreSQL, JWT auth, reusable UI components, testing, and CI.

## Features

- Mobile-first pages:
  - Landing
  - Signup / Login / Password Reset
  - Profile (editable + avatar upload preview)
  - Dashboard (single column mobile, sidebar + multi-column desktop)
- Backend API routes with:
  - payload validation
  - JWT authentication
  - centralized error handling
  - structured logging
- Prisma schema + SQL migration for PostgreSQL
- Zustand global auth state
- Reusable UI component library (`Button`, `Input`, `Card`, `Modal`)
- Jest + React Testing Library samples
- GitHub Actions CI for format/lint/typecheck/test/build
- Docker and docker-compose local development setup

## Tech Stack

- Next.js 16 (App Router + pages API routes)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Zod
- JWT via `jose`
- `bcryptjs` password hashing
- Zustand for global state
- Jest + React Testing Library

Detailed rationale: `docs/tech-stack-rationale.md`

## Project Structure

```text
app/                    # UI routes/layout
pages/api/              # API endpoints
components/             # UI, forms, providers
lib/                    # auth/db/api utilities
prisma/                 # schema + migrations
store/                  # Zustand stores
docs/                   # architecture + API docs
__tests__/              # unit/component tests
```

Full architecture + component hierarchy + data flow: `docs/architecture.md`

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/password-reset`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/user/profile`
- `PUT /api/user/profile`

Detailed request/response/auth contracts: `docs/api.md`

## Local Development

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Seed sample data:

```bash
npm run prisma:seed
```

5. Start dev server:

```bash
npm run dev
```

5. Open: [http://localhost:3000](http://localhost:3000)

## Quality Commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
```

## Docker Local Setup

1. Create `.env` from `.env.example`
2. Run:

```bash
docker compose up --build
```

- App: [http://localhost:3000](http://localhost:3000)
- PostgreSQL: `localhost:5432`

## Deployment Notes

- Configure production env vars (`DATABASE_URL`, `JWT_SECRET`, etc.).
- Run Prisma migrations in your deploy pipeline:

```bash
npx prisma migrate deploy
```

- Build and run:

```bash
npm run build
npm run start
```

## Contributing

See `CONTRIBUTING.md` for contribution workflow, coding standards, and PR checklist.
