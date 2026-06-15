# AGENTS.md — {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

Tech stack: {{TECH_STACK_LIST}}.

## Roster

- `pm-agent` — captures requirements, plans sprints. See `agents/pm-agent.md`.
- `architect-agent` — owns designs and ADRs. See `agents/architect-agent.md`.
- One `{role}-dev-agent` per dev role (with `-N` suffix where count > 1). See `agents/`.
- `qa-agent` — writes and runs tests. See `agents/qa-agent.md`.
- `devops-agent` — owns deployments and operations.
- `docs-agent` — keeps meta docs current.
- `sdlc-orchestrator` — runs cross-cutting operations (retros, graph export, propagation).

## Document conventions

See `CONVENTIONS.md`.

## Git workflow

GitFlow + one worktree per task. **Canonical reference: `GIT_WORKFLOW.md`.** Codex does not auto-load skills the way Claude does; instead, every agent above reads `GIT_WORKFLOW.md` and runs the documented commands directly (they're plain `git` / `gh`). Coordination across agents uses **sync / parallel / resync** modes — declared in the sprint doc by `pm-agent`, arbitrated by `sdlc-orchestrator`.

## Hook parity

Codex does not auto-register the propagation hook. Run propagation manually:

```
node scripts/sdlc-propagate.js path/to/changed/doc.md
```

Or after a session, run:

```
node scripts/sdlc-graph.js
```

to refresh the dependency graph.
