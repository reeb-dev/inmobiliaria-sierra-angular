#!/usr/bin/env bash
set -euo pipefail
cd /workspace
if [[ ! -f dist/sierra-app/browser/index.html ]]; then
  npm run build
fi
exec node scripts/static-server.mjs
