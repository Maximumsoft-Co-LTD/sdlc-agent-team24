---
name: sdlc-agent-template
description: Use when starting a new software project and you want a complete SDLC-aware agent team (role-based sub-agents, helper skills, typed markdown doc model with dependency graph, sprint retrospectives, optional auto-propagation hook). Generates output for Claude Code, Codex, or both.
version: 0.1.0
---

# SDLC Agent Template

Scaffolds a complete SDLC-aware agent team for a new software project.

## What you get

- Role-based **sub-agents** (PM, architect, dev per role, QA, DevOps, docs, orchestrator) for Claude Code and/or Codex.
- A fleet of **helper skills** (`requirement-author`, `design-author`, `task-implementer`, `code-reviewer`, `test-writer`, `test-runner`, `deploy-runner`, `incident-responder`, `sprint-planner`, `sprint-retrospective`, `task-progress-update`, `sdlc-graph-export`, `risk-review`, `docs-updater`).
- A **typed markdown document model** under `docs/sdlc/` with frontmatter that doubles as a queryable dependency graph (requirements → designs → tasks → tests → deployments → operations).
- A `scripts/sdlc-graph.js` exporter that walks the docs and emits `_graph.json` + `_graph.mmd`.
- A `scripts/sdlc-propagate.js` engine that propagates `status:` changes across linked docs.
- **Opt-in** Claude PostToolUse hook that runs propagation automatically on every doc edit.
- A `sprint-retrospective` skill that computes velocity, completion, risk burn-down, and updates per-role growth notes.

## When to invoke

Invoke this skill when:
- Starting a new software project and you want SDLC scaffolding wired up.
- Adding SDLC scaffolding to an existing repo that doesn't have it yet.
- Standing up a multi-role agent team for a project (any size from 1 to ~12 people).

Don't invoke this skill when:
- The project already has `docs/sdlc/` with frontmatter conventions (would conflict).
- You just want to add one agent — edit your agents folder directly instead.

## How to invoke

**Interactive:** invoke with no arguments. The skill asks each input one at a time.

**Config-file:** pass the path to a YAML config matching `inputs-schema.md`:

```
/sdlc-agent-template ./my-project.yaml
```

Add `--yes` to skip the final confirm, `--force` to overwrite a non-empty target.

## How this skill works

Follow `workflow.md` step by step. Use `inputs-schema.md` as the source of truth for what to collect. Use the `lib/` helpers (invoked via Bash) for parsing, substitution, role expansion, validation, and atomic emission. Templates live under `templates/`.

## Version

Current: 0.1.0. The version is stamped into every generated project's `docs/sdlc/_meta.yaml`. See `CHANGELOG.md` for history.
