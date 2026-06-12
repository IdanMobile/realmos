#!/usr/bin/env bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
export REALMOS_USE_MEMORY_DB="${REALMOS_USE_MEMORY_DB:-true}"
cd "$(dirname "$0")/.." || exit 1
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi
exec pnpm --filter @realmos/api dev
