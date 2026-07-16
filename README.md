# Kaizen Quest

A personal habit and goal tracking web app built with Next.js. Track daily, weekly, and monthly goals across categories like health, learning, and productivity.

## Prerequisites

- Node.js 20+
- PostgreSQL database (or Docker for local service DBs)
- Yarn
- Docker Desktop (for local Kafka + per-service Postgres)

## Environment variables

Create a `.env.local` file in the repository root:

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="your-secret-at-least-32-characters"
```

## Getting started

Install dependencies and run migrations:

```bash
yarn install
yarn db:migrate
```

Start the development server:

```bash
yarn dev
# or: nx dev web
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                    | Description                               |
| -------------------------- | ----------------------------------------- |
| `yarn dev`                 | Start development server (`nx dev web`)   |
| `yarn build`               | Run migrations and build for production   |
| `yarn test`                | Run unit tests                            |
| `yarn test:coverage`       | Run tests with coverage (auth modules)    |
| `yarn validate`            | Typecheck, lint, test, and optional Sonar |
| `yarn db:migrate`          | Apply Prisma migrations                   |
| `yarn db:studio`           | Open Prisma Studio                        |
| `nx run-many -t typecheck` | Typecheck all projects                    |
| `yarn infra:up`            | Start Kafka + Postgres (Docker Compose)   |
| `yarn infra:ps`            | Show infra container status               |
| `yarn infra:logs`          | Tail infra logs                           |
| `yarn infra:down`          | Stop infra (keeps volumes)                |

## Local infrastructure

Starts Kafka (KRaft), Kafka UI, and one Postgres per future microservice:

```bash
yarn infra:up
yarn infra:ps
```

| Service            | Host                                           | Notes         |
| ------------------ | ---------------------------------------------- | ------------- |
| Postgres auth      | `localhost:15433` / `auth_db`                  | Phase 3       |
| Postgres goals     | `localhost:15434` / `goals_db`                 | Phase 4       |
| Postgres analytics | `localhost:15435` / `analytics_db`             | Phase 7+      |
| Kafka              | `localhost:9092`                               | Event bus     |
| Kafka UI           | [http://localhost:8080](http://localhost:8080) | Topic browser |

Connection strings are documented in [`.env.example`](.env.example). The web app continues to use `DATABASE_URL` until later cutover phases.

## Monorepo layout

```
apps/web/          Next.js frontend (current product)
libs/shared/utils/ Shared date and Zod helpers
libs/shared/contracts/  Zod API + Kafka contracts (portable)
libs/domain/goals/ Pure goal, streak, and calendar logic
libs/infra/        Docker Compose Nx targets
```

**Vercel:** set the project root directory to `apps/web` in the Vercel dashboard.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- PostgreSQL via Prisma 7
- JWT cookie authentication
- Tailwind CSS 4, shadcn/ui
- Vitest for unit tests
