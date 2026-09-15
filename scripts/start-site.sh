#!/usr/bin/env bash
set -euo pipefail
cd /workspace
export PORT="${PORT:-4200}"
export HOST="${HOST:-0.0.0.0}"
if [[ ! -f dist/sierra-app/browser/index.html ]]; then
  npm run build
fi
exec node scripts/static-server.mjs
