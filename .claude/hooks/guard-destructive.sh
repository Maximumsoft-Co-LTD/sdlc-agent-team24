#!/usr/bin/env bash
# Blocks database drop commands and force-recursive deletes before they run.
# Receives Claude Code tool JSON on stdin; exits 1 + outputs JSON to block.

cmd=$(jq -r '.tool_input.command // ""')

# Block database drop commands
if echo "$cmd" | grep -iEq 'dropDatabase\(\)|DROP[[:space:]]+DATABASE|db\.drop\(\)|dropCollection\('; then
  echo '{"continue":false,"stopReason":"BLOCKED: Database drop command detected. Confirm explicitly with the user before running."}'
  exit 1
fi

# Block rm with any combination of -r/-R and -f/-F flags (e.g. -rf, -fr, -Rf, -rF)
if echo "$cmd" | grep -qE '\brm\b' && \
   echo "$cmd" | grep -qE -- '(-[a-zA-Z]*[rR][a-zA-Z]*[fF]|-[a-zA-Z]*[fF][a-zA-Z]*[rR])'; then
  echo '{"continue":false,"stopReason":"BLOCKED: Force-recursive delete (rm -rf) detected. Confirm explicitly with the user before running."}'
  exit 1
fi
