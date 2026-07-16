# Production deploy (Vercel + Railway + Neon + Kafka)

## Architecture

| Piece                               | Host                                         |
| ----------------------------------- | -------------------------------------------- |
| Next.js web                         | Vercel                                       |
| api-gateway, auth, goals, analytics | Railway (Docker)                             |
| Kafka                               | Railway Redpanda service                     |
| Postgres ×3                         | Neon (`auth_db`, `goals_db`, `analytics_db`) |

Only **api-gateway** is public. Other Nest services and Kafka use Railway private networking.

## One-time setup

### 1. Neon databases

Create three databases (same Neon project or separate):

- `auth_db` → `AUTH_DATABASE_URL`
- `goals_db` → `GOALS_DATABASE_URL`
- `analytics_db` → `ANALYTICS_DATABASE_URL`

Use the **pooled** connection string for runtime. Apply migrations:

```bash
# in .env.local
AUTH_DATABASE_URL=...
GOALS_DATABASE_URL=...
ANALYTICS_DATABASE_URL=...

yarn migrate:be
```

### 2. Railway project

1. Create a Railway project and enable **private networking**.
2. Create five services:

#### `kafka` (Redpanda)

- Docker image: `docker.redpanda.com/redpandadata/redpanda:v24.3.1`
- Service name must be `kafka` (so DNS is `kafka.railway.internal`)
- Start command (see also [railway/kafka.md](../railway/kafka.md)):

```text
redpanda start --overprovisioned --smp 1 --memory 512M --reserve-memory 0M --node-id 0 --check=false --kafka-addr internal://0.0.0.0:9092 --advertise-kafka-addr internal://kafka.railway.internal:9092 --pandaproxy-addr 0.0.0.0:8082 --schema-registry-addr 0.0.0.0:8081
```

- No public networking

#### Nest services (`auth-service`, `goals-service`, `analytics-service`, `api-gateway`)

For each:

| Setting            | Value                                     |
| ------------------ | ----------------------------------------- |
| Root directory     | `/` (repo root)                           |
| Builder            | Dockerfile                                |
| Dockerfile path    | `Dockerfile.service`                      |
| Variable `SERVICE` | matching service name (`auth-service`, …) |
| Healthcheck path   | `/health`                                 |

Config references: [railway/](../railway/).

**Release commands** (DB services only):

| Service           | Release command                                                               |
| ----------------- | ----------------------------------------------------------------------------- |
| auth-service      | `yarn prisma migrate deploy --config apps/auth-service/prisma.config.ts`      |
| goals-service     | `yarn prisma migrate deploy --config apps/goals-service/prisma.config.ts`     |
| analytics-service | `yarn prisma migrate deploy --config apps/analytics-service/prisma.config.ts` |

Generate a **project token** (`RAILWAY_TOKEN`) and note the project id (`RAILWAY_PROJECT_ID`). Optionally set `RAILWAY_ENVIRONMENT` (e.g. `production`). Add these as GitHub Actions secrets for CI.

```bash
railway link   # local only
yarn deploy:be
```

### 3. Railway environment variables

**Shared / Kafka**

```env
KAFKA_BROKERS=kafka.railway.internal:9092
SESSION_SECRET=<same value as Vercel>
```

**auth-service**

```env
SERVICE=auth-service
AUTH_DATABASE_URL=<neon auth pooled>
SESSION_SECRET=...
KAFKA_BROKERS=kafka.railway.internal:9092
```

**goals-service**

```env
SERVICE=goals-service
GOALS_DATABASE_URL=<neon goals pooled>
SESSION_SECRET=...
KAFKA_BROKERS=kafka.railway.internal:9092
```

**analytics-service**

```env
SERVICE=analytics-service
ANALYTICS_DATABASE_URL=<neon analytics pooled>
KAFKA_BROKERS=kafka.railway.internal:9092
KAFKA_ANALYTICS_GROUP_ID=analytics-service
```

**api-gateway** (public HTTPS)

```env
SERVICE=api-gateway
WEB_ORIGIN=https://<your-vercel-domain>
AUTH_SERVICE_URL=http://auth-service.railway.internal:${{auth-service.PORT}}
GOALS_SERVICE_URL=http://goals-service.railway.internal:${{goals-service.PORT}}
ANALYTICS_SERVICE_URL=http://analytics-service.railway.internal:${{analytics-service.PORT}}
```

Railway private DNS hostnames match the **service name**. If private reference variables differ in your Railway version, use the dashboard “Variable Reference” UI for `PORT`.

Generate a public domain on `api-gateway` (Railway networking → generate domain).

### 4. Vercel

Set production env (or use `yarn deploy:web`):

```env
API_GATEWAY_URL=https://<railway-api-gateway-domain>
SESSION_SECRET=<same as auth-service>
```

`DATABASE_URL` is optional for the live app (runtime uses the gateway). Keep it only if you still run legacy Prisma tooling against the monolith DB.

Project root directory in Vercel: `apps/web`.

### 5. Optional data cutover

If production data still lives in the old monolith Neon DB:

```bash
yarn migrate:be
node scripts/cutover-monolith-data.mjs --dry-run
node scripts/cutover-monolith-data.mjs
```

Analytics tables stay empty until new goal events flow through Kafka.

## Deploy scripts

```bash
yarn deploy:be                 # all Nest services
yarn deploy:be --service=api-gateway
yarn deploy:web                # upsert Vercel env + prod deploy
yarn migrate:be                # prisma migrate deploy ×3 against Neon
```

CI on `main`: validate → deploy-be → deploy-web.

### GitHub Actions secrets

| Secret                                | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `VERCEL_TOKEN`                        | Web deploy                                  |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Prefer non-interactive Vercel link          |
| `VERCEL_SCOPE`                        | Optional team scope                         |
| `API_GATEWAY_URL`                     | Public Railway gateway URL for Vercel       |
| `SESSION_SECRET`                      | Shared JWT secret (must match auth-service) |
| `RAILWAY_TOKEN`                       | Railway project token                       |
| `RAILWAY_PROJECT_ID`                  | Railway project id (CI)                     |
| `RAILWAY_ENVIRONMENT`                 | Optional (`production`)                     |
| `SONAR_TOKEN`                         | Optional Sonar                              |

## Verification

1. `GET https://<gateway>/health` → `{ status: "ok", service: "api-gateway" }`
2. Sign up on prod web → row in Neon `auth_db`
3. Create a goal → row in `goals_db`
4. Log a goal event → analytics consumer updates `analytics_db` (no `[kafka] skipped publish` in Railway logs)
5. CORS works for `WEB_ORIGIN`
