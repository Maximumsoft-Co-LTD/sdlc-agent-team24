# AGENTS.md — read24

A web app for tracking household chores across a family.

Tech stack: TypeScript, Next.js, Postgres, Vercel.

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

<!-- secrets-policy -->
## Secrets — never commit (required)

- Secret values (keys, tokens, passwords, connection strings with `user:pass@`) live only in AWS Secrets Manager / GCP Secret Manager and reach pods through ExternalSecret. Git holds only secret and property names.
- Before the first commit in this repo, check that the pre-commit hook is installed: `test -f .git/hooks/pre-commit`. If it is not, remind the user to run `brew install pre-commit && pre-commit install` (or `pipx install pre-commit`).
- Never bypass gitleaks with `git commit --no-verify`. If it flags a value, move the value to the secret store. Add a fingerprint to `.gitleaksignore` only for a real false positive.
- Backstop: an org ruleset scans every pull request and blocks new secrets. A secret pushed to any branch counts as leaked and must be rotated.
- Never print secret values in logs, chat or pull requests; compare by hash.
