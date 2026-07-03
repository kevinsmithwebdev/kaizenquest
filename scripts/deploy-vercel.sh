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

VERCEL_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VERCEL_ARGS+=(--token "$VERCEL_TOKEN")
fi

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${SESSION_SECRET:?SESSION_SECRET is required}"
: "${RESEND_API_KEY:?RESEND_API_KEY is required}"

# Use Neon's pooled endpoint for serverless (Vercel).
if [[ "$DATABASE_URL" != *"-pooler."* ]]; then
  DATABASE_URL="${DATABASE_URL/.c-/-pooler.c-}"
fi

EMAIL_FROM="${EMAIL_FROM:-Kaizen Quest <onboarding@resend.dev>}"

echo "Linking Vercel project (if needed)..."
yarn vercel link --yes "${VERCEL_ARGS[@]}"

echo "Setting production environment variables..."
printf '%s' "$DATABASE_URL" | yarn vercel env add DATABASE_URL production --force "${VERCEL_ARGS[@]}"
printf '%s' "$SESSION_SECRET" | yarn vercel env add SESSION_SECRET production --force "${VERCEL_ARGS[@]}"
printf '%s' "$RESEND_API_KEY" | yarn vercel env add RESEND_API_KEY production --force "${VERCEL_ARGS[@]}"
printf '%s' "$EMAIL_FROM" | yarn vercel env add EMAIL_FROM production --force "${VERCEL_ARGS[@]}"

echo "Deploying to production..."
yarn vercel deploy --prod --yes "${VERCEL_ARGS[@]}"

echo "Done."
