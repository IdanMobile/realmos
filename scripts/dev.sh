#!/usr/bin/env bash
# Start RealmOS local dev (API + web) in one terminal.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Prefer user-local Node when present (matches other scripts in this repo).
if [[ -d "$HOME/.local/node-v22.16.0-darwin-arm64/bin" ]]; then
  export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
fi

export REALMOS_USE_MEMORY_DB="${REALMOS_USE_MEMORY_DB:-true}"

API_PORT="${API_PORT:-4100}"
WEB_PORT="${WEB_PORT:-3000}"
API_URL="http://localhost:${API_PORT}"
WEB_URL="http://localhost:${WEB_PORT}"

PIDS=()
STARTED_API=false
STARTED_WEB=false

log() {
  printf '\033[1;36m[realmos dev]\033[0m %s\n' "$*"
}

warn() {
  printf '\033[1;33m[realmos dev]\033[0m %s\n' "$*" >&2
}

fail() {
  printf '\033[1;31m[realmos dev]\033[0m %s\n' "$*" >&2
  exit 1
}

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

api_healthy() {
  curl -sf "${API_URL}/api/health" >/dev/null 2>&1
}

web_healthy() {
  curl -sf -o /dev/null "${WEB_URL}/" 2>/dev/null
}

ensure_env() {
  if [[ ! -f .env ]]; then
    cp .env.example .env
    log "Created .env from .env.example"
  fi
}

ensure_deps() {
  if [[ ! -x node_modules/.bin/pnpm ]] && [[ ! -d node_modules/.pnpm ]]; then
    log "Installing dependencies (first run)…"
    corepack enable 2>/dev/null || true
    pnpm install
  fi
}

start_logged() {
  local name="$1"
  shift
  "$@" > >(sed "s/^/[$name] /") 2>&1 &
  PIDS+=("$!")
}

cleanup() {
  if ((${#PIDS[@]} == 0)); then
    return
  fi
  echo
  log "Shutting down dev servers…"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

command -v pnpm >/dev/null 2>&1 || fail "pnpm not found. Run: corepack enable"
command -v node >/dev/null 2>&1 || fail "node not found. Install Node.js 22+."

ensure_env
ensure_deps

log "RealmOS dev — starting services"
echo

if port_in_use "$API_PORT"; then
  if api_healthy; then
    warn "API already running on ${API_URL} — skipping API start"
  else
    fail "Port ${API_PORT} is in use but API health check failed. Free the port or set API_PORT in .env"
  fi
else
  start_logged "api" pnpm --filter @realmos/api dev
  STARTED_API=true
  log "Starting API on ${API_URL}…"
fi

if port_in_use "$WEB_PORT"; then
  if web_healthy; then
    warn "Web already running on ${WEB_URL} — skipping web start"
  else
    fail "Port ${WEB_PORT} is in use but web is not responding. Free the port or change WEB_PORT"
  fi
else
  start_logged "web" pnpm --filter @realmos/web dev
  STARTED_WEB=true
  log "Starting web on ${WEB_PORT}…"
fi

if [[ "$STARTED_API" == true ]]; then
  for _ in $(seq 1 30); do
    api_healthy && break
    sleep 0.5
  done
  api_healthy || warn "API not healthy yet — check logs above"
fi

if [[ "$STARTED_WEB" == true ]]; then
  for _ in $(seq 1 60); do
    web_healthy && break
    sleep 0.5
  done
  web_healthy || warn "Web not ready yet — check logs above"
fi

echo
log "Ready"
echo "  Web:  ${WEB_URL}"
echo "  API:  ${API_URL}/api/health"
echo

if ((${#PIDS[@]} == 0)); then
  log "All services were already running — open the URLs above"
  trap - EXIT INT TERM
  exit 0
fi

log "Press Ctrl+C to stop dev servers started by this script"
echo

wait
