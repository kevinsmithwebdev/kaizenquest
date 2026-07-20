# Kaizen Quest

A personal habit and goal tracking web app built with Next.js. Track daily, weekly, and monthly goals across categories like health, learning, and productivity.

## Prerequisites

- Node.js 20+
- PostgreSQL database (or Docker for local service DBs)
- Yarn
- Docker Desktop (for local Kafka + per-service Postgres)

## Environment variables

Create a `.env.local` file in the repository root (see [`.env.example`](.env.example)):

```env
SESSION_SECRET="your-secret-at-least-32-characters"
API_GATEWAY_URL="http://localhost:3003"
AUTH_DATABASE_URL="postgresql://kaizen:kaizen@localhost:15433/auth_db"
GOALS_DATABASE_URL="postgresql://kaizen:kaizen@localhost:15434/goals_db"
ANALYTICS_DATABASE_URL="postgresql://kaizen:kaizen@localhost:15435/analytics_db"
KAFKA_BROKERS="localhost:9092"
```

## Getting started

```bash
yarn install
yarn infra:up
yarn migrate:be
yarn dev:complete
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `yarn dev`            | Start Next.js (`nx dev web`)                     |
| `yarn dev:complete`   | Infra + Nest services + web on :3000             |
| `yarn build`          | Build web for production                         |
| `yarn build:services` | Bundle Nest services to `dist/apps/*/main.mjs`   |
| `yarn deploy:web`     | Upsert Vercel env + deploy web                   |
| `yarn deploy:be`      | Optional manual Railway deploy (not used in CI)  |
| `yarn migrate:be`     | `prisma migrate deploy` for auth/goals/analytics |
| `yarn test`           | Run unit tests                                   |
| `yarn validate`       | Typecheck, lint, test, and optional Sonar        |
| `yarn infra:up`       | Start Kafka + Postgres (Docker Compose)          |
| `yarn infra:down`     | Stop infra (keeps volumes)                       |

## Local infrastructure

```bash
yarn infra:up
yarn infra:ps
```

| Service            | Host                                           |
| ------------------ | ---------------------------------------------- |
| Postgres auth      | `localhost:15433` / `auth_db`                  |
| Postgres goals     | `localhost:15434` / `goals_db`                 |
| Postgres analytics | `localhost:15435` / `analytics_db`             |
| Kafka              | `localhost:9092`                               |
| Kafka UI           | [http://localhost:8080](http://localhost:8080) |

## Microservices (local)

**All-in-one (recommended):** `yarn dev:complete`

**Or manually:**

```bash
yarn infra:up
yarn auth:serve       # :3001
yarn goals:serve      # :3002
yarn gateway:serve    # :3003
yarn analytics:serve  # :3004
yarn dev              # web :3000
```

## Production deploy

Web → **Vercel**. Nest + Kafka + Postgres run **locally** for development.

Full runbook: **[docs/deploy.md](docs/deploy.md)**

```bash
yarn deploy:web   # needs API_GATEWAY_URL + SESSION_SECRET + VERCEL_TOKEN
```

## Monorepo layout

```
apps/web/              Next.js frontend (calls API gateway)
apps/auth-service/     NestJS auth + auth_db
apps/goals-service/    NestJS goals + goals_db
apps/analytics-service NestJS analytics + Kafka consumer
apps/api-gateway/      NestJS HTTP gateway
apps/mobile/           RN/Expo shell (api-client ready)
libs/shared/contracts/ Zod API + Kafka contracts
libs/shared/api-client Gateway fetch client
libs/domain/auth/      JWT + password helpers
libs/domain/goals/     Pure goal/streak/calendar logic
libs/infra/            Docker Compose Nx targets
```

**Vercel:** set the project root directory to `apps/web` in the Vercel dashboard.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- NestJS microservices + Kafka (Redpanda locally)
- PostgreSQL via Prisma 7
- JWT cookie authentication
- Tailwind CSS 4, shadcn/ui
- Vitest for unit tests
