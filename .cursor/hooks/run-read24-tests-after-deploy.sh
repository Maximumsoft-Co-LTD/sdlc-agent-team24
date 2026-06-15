#!/usr/bin/env bash
# Cursor afterShellExecution hook — run read24 post-deploy tests (unit + contract + E2E smoke).
# Triggered by matchers in .cursor/hooks.json, or run manually:
#   bash .cursor/hooks/trigger-read24-post-deploy-tests.sh
#   bash .cursor/hooks/trigger-read24-post-deploy-tests.sh https://your-service.run.app
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TESTS_DIR="${ROOT}/read24-tests"
INPUT="$(cat)"

read_field() {
  node -e "
    const input = JSON.parse(process.argv[1]);
    const key = process.argv[2];
    const value = input[key] ?? input[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
    if (value === undefined || value === null) process.exit(1);
    process.stdout.write(String(value));
  " "$INPUT" "$1" 2>/dev/null || true
}

normalize_api_url() {
  local url="${1%/}"
  printf '%s' "$url"
}

resolve_read24_api_url() {
  if [[ -n "${READ24_API_URL:-}" ]]; then
    READ24_API_URL="$(normalize_api_url "$READ24_API_URL")"
    export READ24_API_URL
    return 0
  fi

  if [[ -z "${COMMAND:-}" ]]; then
    return 1
  fi

  if ! printf '%s' "$COMMAND" | grep -qE 'gcloud[[:space:]]+run[[:space:]]+deploy'; then
    return 1
  fi

  if ! command -v gcloud >/dev/null 2>&1; then
    return 1
  fi

  local service region
  service="$(printf '%s' "$COMMAND" | sed -nE 's/.*gcloud[[:space:]]+run[[:space:]]+deploy[[:space:]]+([^[:space:]]+).*/\1/p' | head -1)"
  region="$(printf '%s' "$COMMAND" | sed -nE 's/.*--region[[:space:]]+([^[:space:]]+).*/\1/p' | head -1)"

  if [[ -z "$service" || -z "$region" ]]; then
    return 1
  fi

  local discovered
  discovered="$(gcloud run services describe "$service" --region "$region" --format='value(status.url)' 2>/dev/null || true)"
  if [[ -n "$discovered" ]]; then
    READ24_API_URL="$(normalize_api_url "$discovered")"
    export READ24_API_URL
    return 0
  fi

  return 1
}

EXIT_CODE="$(read_field exit_code)"
if [[ -z "$EXIT_CODE" ]]; then
  EXIT_CODE="$(read_field exitCode)"
fi
COMMAND="$(read_field command)"

if [[ -z "$EXIT_CODE" || "$EXIT_CODE" != "0" ]]; then
  exit 0
fi

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

if ! printf '%s' "$COMMAND" | grep -qE 'deploy|kubectl apply|kubectl rollout|helm upgrade|helm install|gcloud[[:space:]]+run[[:space:]]+deploy|read24-post-deploy'; then
  exit 0
fi

if [[ ! -d "$TESTS_DIR" ]]; then
  node -e "console.log(JSON.stringify({ agent_message: 'Read24 post-deploy hook: read24-tests directory not found.' }))"
  exit 0
fi

if [[ -f "${TESTS_DIR}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${TESTS_DIR}/.env"
  set +a
fi

resolve_read24_api_url || true

cd "$TESTS_DIR"

if [[ ! -d node_modules ]]; then
  npm ci --silent 2>/dev/null || npm install --silent
fi

LOG_FILE="$(mktemp)"
UNIT_EXIT=0
E2E_EXIT=0

npm run test >"$LOG_FILE" 2>&1 || UNIT_EXIT=$?

if [[ -n "${READ24_API_URL:-}" ]]; then
  SUITE="unit + contract + E2E smoke"
  if [[ "$UNIT_EXIT" -eq 0 ]]; then
    E2E_LOG="$(mktemp)"
    READ24_API_URL="$READ24_API_URL" npm run test:e2e >"$E2E_LOG" 2>&1 || E2E_EXIT=$?
    cat "$E2E_LOG" >>"$LOG_FILE"
    rm -f "$E2E_LOG"
  else
    E2E_EXIT=3
    printf '\nSkipped E2E smoke because unit/contract tests failed.\n' >>"$LOG_FILE"
  fi
else
  SUITE="unit + contract only (set READ24_API_URL in read24-tests/.env for E2E)"
  E2E_EXIT=-1
fi

TEST_EXIT=0
if [[ "$UNIT_EXIT" -ne 0 || "$E2E_EXIT" -gt 0 ]]; then
  TEST_EXIT=1
fi

LOG_TAIL="$(tail -n 60 "$LOG_FILE")"
rm -f "$LOG_FILE"

export TEST_EXIT UNIT_EXIT E2E_EXIT SUITE LOG_TAIL READ24_API_URL="${READ24_API_URL:-}"
node <<'NODE'
const testExit = Number(process.env.TEST_EXIT || 0);
const unitExit = Number(process.env.UNIT_EXIT || 0);
const e2eExit = Number(process.env.E2E_EXIT || 0);
const suite = process.env.SUITE || '';
const logTail = process.env.LOG_TAIL || '';
const apiUrl = process.env.READ24_API_URL || '';

let e2eStatus = '';
if (apiUrl) {
  if (e2eExit === 0) e2eStatus = 'E2E smoke: PASSED';
  else if (e2eExit === 1) e2eStatus = 'E2E smoke: FAILED';
  else if (e2eExit === 2) e2eStatus = 'E2E smoke: SKIPPED (no published books or READ24_API_URL)';
  else if (e2eExit === 3) e2eStatus = 'E2E smoke: SKIPPED (unit/contract failed first)';
  else e2eStatus = 'E2E smoke: not run';
} else {
  e2eStatus = 'E2E smoke: skipped (set READ24_API_URL in read24-tests/.env)';
}

const header =
  testExit === 0
    ? `Read24 post-deploy tests PASSED (${suite})`
    : `Read24 post-deploy tests FAILED (exit ${testExit}, ${suite})`;

const unitStatus =
  unitExit === 0 ? 'Unit + contract: PASSED' : `Unit + contract: FAILED (exit ${unitExit})`;

const details = [
  header,
  unitStatus,
  apiUrl ? `API target: ${apiUrl}` : '',
  e2eStatus,
  testExit !== 0 && logTail ? `Last output:\n${logTail}` : '',
]
  .filter(Boolean)
  .join('\n');

console.log(JSON.stringify({ agent_message: details }));
NODE

exit 0
