# Production deploy (Vercel web)

The Nest microservices stack runs **locally only** (`yarn dev:complete` / Docker Compose). CI deploys the Next.js web app to Vercel.

## Architecture

| Piece                               | Host                          |
| ----------------------------------- | ----------------------------- |
| Next.js web                         | Vercel                        |
| api-gateway, auth, goals, analytics | Local (Docker Compose + Nest) |
| Kafka                               | Local (Redpanda in Compose)   |
| Postgres ×3                         | Local (Compose) or Neon       |

## Local backend

```bash
yarn infra:up
yarn migrate:be
yarn dev:complete
```

Web on [http://localhost:3000](http://localhost:3000), API gateway on [http://localhost:3003](http://localhost:3003).

Set in `.env.local`:

```env
API_GATEWAY_URL=http://localhost:3003
SESSION_SECRET=<at least 32 chars>
AUTH_DATABASE_URL=postgresql://kaizen:kaizen@localhost:15433/auth_db
GOALS_DATABASE_URL=postgresql://kaizen:kaizen@localhost:15434/goals_db
ANALYTICS_DATABASE_URL=postgresql://kaizen:kaizen@localhost:15435/analytics_db
KAFKA_BROKERS=localhost:9092
```

## Vercel (web)

Set production env (or use `yarn deploy:web`):

```env
API_GATEWAY_URL=<public URL that reaches your API gateway>
SESSION_SECRET=<same value as local auth-service>
```

**Note:** With the backend hosted locally, production web on Vercel cannot reach `localhost`. Point `API_GATEWAY_URL` at a publicly reachable gateway (e.g. a tunnel) or auth/goals will fail in prod until the architecture changes.

Project root directory in Vercel: `apps/web`.

## Deploy scripts

```bash
yarn deploy:web                # upsert Vercel env + prod deploy
yarn migrate:be                # prisma migrate deploy ×3 (local or Neon URLs)
```

CI on `main`: validate → deploy-web.

Optional manual Railway deploy (not used in CI):

```bash
yarn deploy:be
yarn deploy:be --service=api-gateway
```

See [railway/](../railway/) if you set up Railway yourself.

### GitHub Actions secrets

| Secret                                | Purpose                                |
| ------------------------------------- | -------------------------------------- |
| `VERCEL_TOKEN`                        | Web deploy                             |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Prefer non-interactive Vercel link     |
| `VERCEL_SCOPE`                        | Optional team scope                    |
| `API_GATEWAY_URL`                     | Public gateway URL for Vercel runtime  |
| `SESSION_SECRET`                      | Shared JWT secret (must match backend) |
| `SONAR_TOKEN`                         | Optional Sonar                         |

## Verification

**Local**

1. `GET http://localhost:3003/health` → `{ status: "ok", service: "api-gateway" }`
2. Sign up on local web → row in `auth_db`
3. Create a goal → row in `goals_db`

**Production (Vercel)**

1. Web loads at your Vercel domain
2. Sign-in/sign-up work only if `API_GATEWAY_URL` is reachable from Vercel
