#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required — create one at https://vercel.com/account/tokens}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${SESSION_SECRET:?SESSION_SECRET is required}"
: "${RESEND_API_KEY:?RESEND_API_KEY is required}"

if [[ "$DATABASE_URL" != *"-pooler."* ]]; then
  DATABASE_URL="${DATABASE_URL/.c-/-pooler.c-}"
fi

EMAIL_FROM="${EMAIL_FROM:-Kaizen Quest <onboarding@resend.dev>}"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-kaizenquest}"

api() {
  local method="$1"
  local path="$2"
  shift 2
  curl -fsS -X "$method" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "$@" \
    "https://api.vercel.com$path"
}

echo "Looking up Vercel project: $PROJECT_NAME"
PROJECT_ID="$(api GET "/v9/projects?search=$PROJECT_NAME" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const project = (data.projects || []).find((p) => p.name === process.argv[1]);
if (!project) {
  console.error('Project not found:', process.argv[1]);
  process.exit(1);
}
process.stdout.write(project.id);
" "$PROJECT_NAME")"

upsert_env() {
  local key="$1"
  local value="$2"
  local existing
  existing="$(api GET "/v9/projects/$PROJECT_ID/env" | node -e "
const key = process.argv[1];
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const match = (data.envs || []).find((env) => env.key === key && env.target?.includes('production'));
process.stdout.write(match ? match.id : '');
" "$key")"

  if [[ -n "$existing" ]]; then
    api PATCH "/v9/projects/$PROJECT_ID/env/$existing" \
      -d "{\"value\":$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$value"),\"target\":[\"production\"]}" >/dev/null
    echo "Updated $key"
  else
    api POST "/v9/projects/$PROJECT_ID/env" \
      -d "{\"key\":\"$key\",\"value\":$(node -e "process.stdout.write(JSON.stringify(process.argv[1]))" "$value"),\"type\":\"encrypted\",\"target\":[\"production\"]}" >/dev/null
    echo "Created $key"
  fi
}

upsert_env DATABASE_URL "$DATABASE_URL"
upsert_env SESSION_SECRET "$SESSION_SECRET"
upsert_env RESEND_API_KEY "$RESEND_API_KEY"
upsert_env EMAIL_FROM "$EMAIL_FROM"

echo "Triggering production deployment..."
api POST "/v13/deployments" \
  -d "{\"name\":\"$PROJECT_NAME\",\"project\":\"$PROJECT_ID\",\"target\":\"production\",\"gitSource\":{\"type\":\"github\",\"repoId\":null,\"ref\":\"main\",\"repo\":\"kevinsmithwebdev/kaizenquest\"}}" 2>/dev/null \
  || yarn vercel deploy --prod --yes --token "$VERCEL_TOKEN"

echo "Environment configured. Check https://$PROJECT_NAME.vercel.app once the deployment finishes."
