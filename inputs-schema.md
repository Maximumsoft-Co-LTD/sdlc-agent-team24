# Inputs Schema — sdlc-agent-template

Source of truth for both the interactive Q&A flow and the YAML config validator.

## Fields

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `project_name` | string (kebab-case, ^[a-z][a-z0-9-]*$) | yes | — | Becomes folder + doc title |
| `description` | string | yes | — | One paragraph; embedded in CLAUDE.md / AGENTS.md |
| `tech_stack` | list[string], non-empty | yes | — | Drives stack-specific hints in generated skills |
| `team_roles` | list[`{role: string, count: int>=1, seniority?: "junior"|"mid"|"senior"}`], non-empty | yes | — | Each role generates one or more sub-agent files |
| `sprint_length_days` | int (1–60) | no | 14 | |
| `target_platform` | enum `"claude"|"codex"|"both"` | yes | — | |
| `output_dir` | string (absolute or relative path) | yes | — | Where to write the generated tree |
| `sdlc_stages` | list[enum], subset of full set, non-empty | no | `[requirements, design, code, testing, deployment, operations]` | Stages to scaffold |
| `risk_levels` | list[string], non-empty | no | `[low, medium, high, critical]` | Used in the `risk:` enum |

Known roles (interactive Q&A multiple choice): `product`, `architect`, `backend`, `frontend`, `mobile`, `qa`, `devops`, `docs`, `Other`.

## YAML config example

```yaml
project_name: my-app
description: A web app for tracking household chores.
tech_stack: [TypeScript, Next.js, Postgres]
team_roles:
  - {role: backend, count: 2}
  - {role: frontend, count: 1, seniority: senior}
  - {role: qa, count: 1}
sprint_length_days: 14
target_platform: both
output_dir: ./my-app
sdlc_stages: [requirements, design, code, testing, deployment, operations]
risk_levels: [low, medium, high, critical]
```

## Validation rules

- `project_name` must match `^[a-z][a-z0-9-]*$`.
- `team_roles` must have at least one entry, and `count` >= 1.
- `sprint_length_days` between 1 and 60 inclusive.
- `output_dir` is treated as a literal path (no shell expansion). The skill resolves `~` and relative paths against `process.cwd()`.
- `sdlc_stages` entries must be drawn from the full set above.
