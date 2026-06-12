#!/usr/bin/env bash
# Run web dev using user-local Node (works without Homebrew)
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")/.." || exit 1
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi
exec pnpm --filter @realmos/web dev
