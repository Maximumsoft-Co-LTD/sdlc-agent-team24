# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things in one:

1. **`sdlc-agent-template` skill** — a Claude Code skill that scaffolds a complete SDLC-aware agent team for any new project. Entry point: `SKILL.md`.
2. **`read24`** — the sample application the skill generated, a Next.js e-book platform living under `repos/read24/`.

## Commands

### Skill (repo root)
```bash
npm test                        # node --test tests/*.test.js
node scripts/next-id.js <type>  # get next free artifact ID (e.g., next-id.js TASK)
node scripts/sdlc-graph.js      # regenerate _graph.json and _graph.mmd
node scripts/sdlc-propagate.js  # propagate status changes across linked artifacts
```

### read24 app (`repos/read24/`)
```bash
docker compose up -d            # start MongoDB + MinIO (required before dev/build)
npm run dev                     # next dev — http://localhost:3000
npm run build                   # next build
npm run lint                    # next lint (ESLint)
```

Environment: copy `repos/read24/.env.example` to `repos/read24/.env.local` and fill in secrets.

## SDLC artifact system

All project artifacts live under `docs/sdlc/` as markdown files with YAML frontmatter. The frontmatter is the dependency graph.

| Folder | Type | Purpose |
|---|---|---|
| `requirements/` | REQ-XXXX | What the system must do |
| `designs/` | DES-XXXX | How we'll do it + Pre-Implementation Specs (frozen before coding) |
| `adrs/` | ADR-XXXX | Architectural decisions |
| `tasks/` | TASK-XXXX | Executable work units |
| `tests/` | TEST-XXXX | Verification |
| `deployments/` | DEP-XXXX | Rollouts + SemVer tags |
| `sprints/` | SPRINT-XXXX | Velocity, coordination mode, retro |

Status values: `proposed → approved → in_progress → done` (also `blocked`, `cancelled`).

Key relationship fields: `implements:`, `designed_by:`, `verified_by:`, `deployed_in:`, `blocks:` / `blocked_by:`.

Run `node scripts/sdlc-propagate.js` after any status change (a PostToolUse hook can automate this).

## Agent roles

Eight role agents live in `.claude/agents/`. Each owns a specific slice of the artifact ledger:

- **pm-agent** — requirements, sprint planning, task creation
- **architect-agent** — designs, ADRs
- **backend-dev / frontend-dev** — task implementation
- **qa-agent** — test artifacts and test runs
- **devops-agent** — deployments, releases, operations
- **docs-agent** — README, CLAUDE.md, AGENTS.md
- **sdlc-orchestrator** — cross-cutting (retros, risk review, graph export)

Full roster: `AGENTS.md`. Full conventions: `CONVENTIONS.md`.

## Git workflow

GitFlow branches (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`) with **one git worktree per task** under `.worktrees/<TASK-ID>/`. Never edit code in the main checkout, never commit directly to `main` or `develop`, never force-push to shared branches.

The `/git-workflow` skill handles all git operations (worktree create, branch, commit, PR open/merge, release, hotfix). Full reference: `GIT_WORKFLOW.md`.

## read24 architecture

Next.js 14 App Router app. API-first: all data mutations go through REST endpoints under `src/app/api/v1/`.

**Auth:** JWT access tokens (15 min) + refresh token rotation. Middleware at `src/middleware.ts` enforces route protection. Helper: `src/lib/auth.ts`.

**Storage:** MongoDB via `src/lib/mongodb.ts` (connection singleton). File storage (EPUB, covers) via MinIO/S3 at `src/lib/minio.ts`.

**Roles:** `reader`, `publisher`, `admin` — enforced in API route handlers.

**Domain types** are centralized in `src/types/index.ts`: User, Book, Order, Entitlement, Wallet, WalletTransaction, ReadingProgress, RevenueSplit, and more.

**Key flows:**
- Purchase: `POST /api/v1/orders` → deducts wallet coins → creates Entitlement
- Auth: `POST /api/v1/auth/login` → returns `{ accessToken, refreshToken }`; refresh at `/api/v1/auth/refresh`
- EPUB reading: progress tracked per-book per-user via CFI positions
