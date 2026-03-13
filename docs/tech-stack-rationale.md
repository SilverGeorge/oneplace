# Tech Stack Rationale

## Next.js + TypeScript

- Single framework for frontend pages and backend API routes.
- App Router gives modern routing and layout composition.
- TypeScript reduces integration bugs between client and server.

## Tailwind CSS

- Fast mobile-first styling with reusable utility patterns.
- Easy design consistency through shared classes/tokens.

## Prisma + PostgreSQL

- Prisma offers type-safe DB access and migration tooling.
- PostgreSQL is reliable for transactional SaaS workloads.

## JWT + HttpOnly Cookies + bcrypt

- JWT enables stateless auth checks in API routes and middleware.
- HttpOnly cookie reduces token exposure to XSS.
- bcrypt hashing protects credentials at rest.

## Zustand

- Lightweight global state store for auth session/user profile state.
- Lower boilerplate than Redux for MVP-to-production transition.

## Jest + React Testing Library

- Unit and component-level confidence for critical UI flows.
- RTL tests behavior from user perspective rather than implementation details.

## GitHub Actions

- Enforces quality gates (format/lint/type/test/build) on every PR.
- Prevents regressions before merge.
