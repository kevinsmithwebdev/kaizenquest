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

## Local runbook

This is a **local-only** app. Full setup: **[docs/deploy.md](docs/deploy.md)**

## Architecture

```mermaid
flowchart TB
  subgraph Clients
    Web["apps/web<br/>Next.js :3000"]
    Mobile["apps/mobile<br/>Expo shell"]
  end

  subgraph Shared["Shared libs"]
    Contracts["@kaizen/shared-contracts"]
    ApiClient["@kaizen/shared-api-client"]
    DomainAuth["@kaizen/domain-auth"]
    DomainGoals["@kaizen/domain-goals"]
  end

  GW["apps/api-gateway<br/>:3003"]

  subgraph Services["NestJS services"]
    Auth["auth-service :3001"]
    Goals["goals-service :3002"]
    Analytics["analytics-service :3004"]
  end

  subgraph Data["PostgreSQL (database-per-service)"]
    AuthDB[(auth_db :15433)]
    GoalsDB[(goals_db :15434)]
    AnalyticsDB[(analytics_db :15435)]
  end

  Kafka{{"Kafka / Redpanda<br/>:9092"}}

  Web --> ApiClient
  Mobile --> ApiClient
  ApiClient -->|"Bearer JWT"| GW
  Web -.->|"server actions<br/>cookie JWT"| GW

  GW -->|"/auth/*"| Auth
  GW -->|"/goals/*"| Goals
  GW -->|"/analytics/*"| Analytics

  Auth --> AuthDB
  Goals --> GoalsDB
  Analytics --> AnalyticsDB

  Auth -->|"user-registered"| Kafka
  Goals -->|"goal-created / updated<br/>deleted / event-logged"| Kafka
  Kafka -->|"goal-event-logged"| Analytics

  Auth --- DomainAuth
  Goals --- DomainGoals
  Contracts -.-> Auth & Goals & Analytics & ApiClient
```

**Request path:** Browser → Next.js (RSC / server actions) → API gateway → auth / goals / analytics → Postgres.

**Event path:** auth & goals publish Kafka topics; analytics consumes `goal-event-logged` into streak/activity projections.

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

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- NestJS microservices + Kafka (Redpanda locally)
- PostgreSQL via Prisma 7
- JWT cookie authentication
- Tailwind CSS 4, shadcn/ui
- Vitest for unit tests
