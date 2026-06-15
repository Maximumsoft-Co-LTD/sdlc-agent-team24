# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Tech stack

{{TECH_STACK_LIST}}

## Team

{{ROLES_SUMMARY}} (total: {{TEAM_SIZE}})

## SDLC

See `CONVENTIONS.md` for the document conventions and `docs/sdlc/_templates/` for blank artifact templates.

Run `node scripts/sdlc-graph.js` to generate the dependency graph.

## Git workflow

GitFlow (`main` / `develop` / `feature/*` / `release/*` / `hotfix/*`) with **one worktree per task** under `.worktrees/<TASK-ID>/`. Read `GIT_WORKFLOW.md` once for the rules; agents invoke the `git-workflow` skill (`.claude/skills/git-workflow/SKILL.md`) for every git action. Coordination across agents uses **sync / parallel / resync** modes — see `CONVENTIONS.md`.

## Agents & skills

- Agents live under `.claude/agents/` (Claude Code) and/or `AGENTS.md` + `agents/` (Codex).
- Skills live under `.claude/skills/` (Claude Code).

## Optional: enable auto-propagation hook

The skill ships an opt-in PostToolUse hook that auto-propagates status changes across linked SDLC docs. To enable, copy the snippet from `.claude/settings.snippet.json` into your `.claude/settings.json`.
