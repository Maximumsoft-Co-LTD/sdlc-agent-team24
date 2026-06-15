#!/usr/bin/env bash
# Manual post-deploy test trigger (matches read24-post-deploy in hooks.json).
# Usage:
#   bash .cursor/hooks/trigger-read24-post-deploy-tests.sh
#   bash .cursor/hooks/trigger-read24-post-deploy-tests.sh https://read24-xxx.run.app
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMMAND="read24-post-deploy"
API_URL="${1:-}"

PAYLOAD="{\"command\":\"${COMMAND}\",\"exit_code\":0}"
if [[ -n "$API_URL" ]]; then
  export READ24_API_URL="${API_URL%/}"
fi

printf '%s' "$PAYLOAD" | bash "${ROOT}/.cursor/hooks/run-read24-tests-after-deploy.sh"
