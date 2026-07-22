# Local development

Everything runs on your machine: Next.js web, Nest microservices, Kafka, and Postgres.

## Architecture

| Piece                               | Host                          |
| ----------------------------------- | ----------------------------- |
| Next.js web                         | Local (`yarn dev` / :3000)    |
| api-gateway, auth, goals, analytics | Local (Docker Compose + Nest) |
| Kafka                               | Local (Redpanda in Compose)   |
| Postgres ×3                         | Local (Compose) or Neon       |

## Start the stack

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

## Useful scripts

```bash
yarn migrate:be                # prisma migrate deploy ×3
yarn deploy:be                 # optional manual Railway deploy
yarn deploy:be --service=api-gateway
```

See [railway/](../railway/) if you set up Railway yourself.

### GitHub Actions secrets

| Secret        | Purpose        |
| ------------- | -------------- |
| `SONAR_TOKEN` | Optional Sonar |

CI on `main` / PRs runs validate only (typecheck, build services, tests, optional Sonar).

## Verification

1. `GET http://localhost:3003/health` → `{ status: "ok", service: "api-gateway" }`
2. Sign up on local web → row in `auth_db`
3. Create a goal → row in `goals_db`

## VPS production (Hetzner + Traefik)

Assumes platform infra is already running: `traefik`, `postgres`, `redpanda` on Docker networks `proxy` and `internal`.

### 1. Push code, clone on the VPS

```bash
# On your PC: commit + push docker-compose.prod.yml, then on the VPS:
git clone <your-repo-url> /opt/platform/apps/kaizen
cd /opt/platform/apps/kaizen
```

### 2. Create `.env.prod`

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Set:

- `POSTGRES_PASSWORD` — from `/opt/platform/secrets/postgres_password.txt`
- `SESSION_SECRET` — `openssl rand -hex 32`
- `VPS_PUBLIC_URL` — `http://159.69.146.228` (or your domain later)

### 3. Create databases (once)

```bash
PW=$(cat /opt/platform/secrets/postgres_password.txt)
docker exec -i postgres psql -U platform -d platform <<SQL
CREATE DATABASE auth_db OWNER platform;
CREATE DATABASE goals_db OWNER platform;
CREATE DATABASE analytics_db OWNER platform;
SQL
```

Ignore “already exists” if you re-run.

### 4. Migrate + start backend

```bash
cd /opt/platform/apps/kaizen
docker compose -f docker-compose.prod.yml --profile migrate run --rm migrate
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

First build takes several minutes on a small VPS.

### 5. Verify

From your PC:

```bash
curl http://159.69.146.228/health
```

Expected: `{"status":"ok","service":"api-gateway"}`.

Traefik routes `/health`, `/auth`, `/goals`, `/analytics` to `kaizen-api-gateway` (path-based, no `Host` header needed).

### 6. Wire the web app (when deployed)

Wherever Next.js runs in production:

```env
API_GATEWAY_URL=http://159.69.146.228
SESSION_SECRET=<same value as .env.prod on the VPS>
```
