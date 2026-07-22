#!/usr/bin/env bash
# Deploy Nest backend on the Hetzner VPS (Traefik + shared postgres/redpanda).
#
# Run on the VPS from the app repo:
#   ./scripts/deploy-be-vps.sh
#   ./scripts/deploy-be-vps.sh --migrate
#   ./scripts/deploy-be-vps.sh --service=api-gateway
#   ./scripts/deploy-be-vps.sh --no-pull
#
# Env (optional):
#   PLATFORM_ROOT=/opt/platform
#   HEALTH_URL=http://127.0.0.1/health
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PLATFORM_ROOT="${PLATFORM_ROOT:-/opt/platform}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1/health}"

DO_PULL=1
DO_MIGRATE=0
DO_INFRA=1
SERVICE=""

ALL_SERVICES=(auth-service goals-service analytics-service api-gateway)

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy-be-vps.sh [options]

Options:
  --migrate           Run Prisma migrations before rebuild
  --service=NAME      Build/restart only one service
                      (auth-service|goals-service|analytics-service|api-gateway)
  --no-pull           Skip git pull
  --no-infra          Skip ensuring postgres/traefik/redpanda are up
  -h, --help          Show this help
EOF
}

for arg in "$@"; do
  case "$arg" in
    --migrate) DO_MIGRATE=1 ;;
    --no-pull) DO_PULL=0 ;;
    --no-infra) DO_INFRA=0 ;;
    --service=*) SERVICE="${arg#*=}" ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -n "$SERVICE" ]]; then
  ok=0
  for s in "${ALL_SERVICES[@]}"; do
    if [[ "$s" == "$SERVICE" ]]; then
      ok=1
      break
    fi
  done
  if [[ "$ok" -ne 1 ]]; then
    echo "Unknown service: $SERVICE" >&2
    echo "Expected one of: ${ALL_SERVICES[*]}" >&2
    exit 1
  fi
  SERVICES=("$SERVICE")
else
  SERVICES=("${ALL_SERVICES[@]}")
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing $COMPOSE_FILE in $ROOT" >&2
  exit 1
fi

if [[ ! -f .env.prod ]]; then
  echo "Missing .env.prod in $ROOT" >&2
  exit 1
fi

ensure_compose_up() {
  local dir="$1"
  if [[ -f "$dir/docker-compose.yml" ]]; then
    echo "→ Ensuring $(basename "$dir") is up..."
    (cd "$dir" && docker compose up -d)
  else
    echo "⚠ Skipping missing compose dir: $dir"
  fi
}

if [[ "$DO_INFRA" -eq 1 ]]; then
  ensure_compose_up "$PLATFORM_ROOT/postgres"
  ensure_compose_up "$PLATFORM_ROOT/redpanda"
  ensure_compose_up "$PLATFORM_ROOT/traefik"
fi

if [[ "$DO_PULL" -eq 1 ]]; then
  echo "→ git pull..."
  git pull --ff-only
fi

if [[ "$DO_MIGRATE" -eq 1 ]]; then
  echo "→ Running migrations..."
  docker run --rm \
    --network internal \
    --env-file .env.prod \
    -v "$ROOT:/app" \
    -w /app \
    node:22-bookworm-slim \
    bash -c 'corepack enable && yarn install --frozen-lockfile && yarn prisma generate --config apps/auth-service/prisma.config.ts && yarn prisma generate --config apps/goals-service/prisma.config.ts && yarn prisma generate --config apps/analytics-service/prisma.config.ts && yarn migrate:be'
fi

echo "→ Building services (sequential): ${SERVICES[*]}"
for svc in "${SERVICES[@]}"; do
  echo "  • build $svc"
  docker compose -f "$COMPOSE_FILE" build "$svc"
done

echo "→ Starting services..."
docker compose -f "$COMPOSE_FILE" up -d "${SERVICES[@]}"

echo "→ Waiting for gateway health..."
ok=0
for _ in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 2
done

echo
docker compose -f "$COMPOSE_FILE" ps
echo

if [[ "$ok" -eq 1 ]]; then
  echo "✓ Health check passed: $HEALTH_URL"
  curl -fsS "$HEALTH_URL" || true
  echo
else
  echo "✗ Health check failed: $HEALTH_URL" >&2
  echo "Recent api-gateway logs:" >&2
  docker compose -f "$COMPOSE_FILE" logs --tail=40 api-gateway >&2 || true
  exit 1
fi
