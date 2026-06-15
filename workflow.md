# Workflow — sdlc-agent-template

This document is the procedure you (the LLM running the skill) follow every time the skill is invoked. Follow it in order. Do not skip steps.

## Step 1 — Detect mode

If the user passed an argument that ends in `.yaml` or `.yml` and the file exists, switch to **non-interactive** mode. Otherwise **interactive** mode.

If `--yes` appears in the args, set `skip_confirm = true`.
If `--force` appears in the args, set `force_overwrite = true`.

## Step 2 — Collect inputs

### Interactive mode

Use the `AskUserQuestion` tool, **one question at a time**, in the order defined in `inputs-schema.md`. Multiple-choice when possible. After each answer, store it in a local in-memory config object.

For the `team_roles` field — which is a list — first ask "How many distinct roles?" (1–10), then loop: for each role index, ask role-name (multiple choice from the standard set + "Other"), count (1–10), seniority (junior/mid/senior/skip).

### Non-interactive mode

Run:
```
node lib/validate-config.js <path-to-config.yaml>
```

If exit code != 0, print the validation output and **stop**. If exit code == 0, the script prints normalized JSON to stdout — capture it as the config object.

## Step 3 — Confirm the plan

Print a single screen summarizing:
- Target dir (`output_dir`)
- Platform(s) (`target_platform`)
- Roles to generate (with counts), and the resulting list of sub-agent files
- The fixed list of helper skills that will be generated
- Hook opt-in status (will be written but NOT auto-enabled in `settings.json`)

If `skip_confirm` is `false`, ask "Proceed? (yes/no)". On anything other than "yes", **stop**.

## Step 4 — Refuse to overwrite

If `output_dir` exists and is non-empty AND `force_overwrite` is `false`, **stop** with a clear message listing what's in it.

## Step 5 — Stage and emit

Run:
```
node lib/emit.js <config-json-path> <staging-dir> <skill-templates-dir>
```

This script:
1. Walks `templates/shared/`, then `templates/claude/` and/or `templates/codex/` per `target_platform`.
2. Applies `{{PLACEHOLDER}}` substitution using `lib/substitute.js`.
3. Applies per-role expansion using `lib/role-expand.js` (files containing `__ROLE__` in the path are emitted N times, once per role × count).
4. Writes everything to `<staging-dir>`.
5. On success, atomically moves `<staging-dir>` to `output_dir` (or merges if `force_overwrite`).

If the script fails, print its stderr and **stop**. The staging dir is left for inspection.

## Step 6 — Stamp metadata

After emit succeeds, write `docs/sdlc/_meta.yaml` inside `output_dir` containing:
- `generated_at: <today's date in YYYY-MM-DD>` (use the user-supplied date if interactive; the skill version's release date if not)
- `skill_version: 0.1.0`
- `inputs: <the full normalized config>`
- `file_hashes: <map of relative-path → sha256>` (compute via `node lib/emit.js --hash <output_dir>`)

## Step 7 — Initialize git

If `<output_dir>/.git` does not exist:
```
cd <output_dir> && git init && git add . && git commit -m "chore: scaffold SDLC agent template (v0.1.0)"
```

Otherwise, just `git add` the new files inside `output_dir` and **do not commit** — let the user commit.

## Step 8 — Print next steps

Print exactly:

```
Done. Next steps:

1. Review CLAUDE.md (or AGENTS.md) at the project root and adjust role briefs as needed.
2. (Optional) Enable the auto-propagation hook by adding these two lines to .claude/settings.json:
     "hooks": { "PostToolUse": [{ "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": ".claude/hooks/sdlc-propagate.sh" }] }] }
   See .claude/settings.snippet.json for the full snippet.
3. Run `node scripts/sdlc-graph.js` to generate _graph.json and _graph.mmd.
4. Invoke pm-agent to draft your first requirement.
```
