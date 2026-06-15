# sdlc-agent-template

A Claude Code / Codex **skill** that scaffolds a complete SDLC-aware agent team for a new software project: role-based sub-agents (PM, architect, dev-per-role, QA, DevOps, docs, orchestrator), a fleet of helper skills, a typed-markdown doc model with a queryable dependency graph, sprint retrospectives, and an opt-in auto-propagation hook.

See [`SKILL.md`](./SKILL.md) for the full skill spec and [`workflow.md`](./workflow.md) for the procedure the skill follows on every invocation.

## Install from git

The repo root **is** the skill. Clone it into your skills directory under the skill name.

### Claude Code — user-global install

```bash
git clone https://github.com/apaichon/sdlc-agent-template.git \
  ~/.claude/skills/sdlc-agent-template
```

Then in any Claude Code session:

```
/sdlc-agent-template
```

### Claude Code — project-local install

```bash
git clone https://github.com/apaichon/sdlc-agent-template.git \
  .claude/skills/sdlc-agent-template
```

The skill becomes available only inside that project.

### Codex CLI

```bash
git clone https://github.com/apaichon/sdlc-agent-template.git \
  ~/.codex/skills/sdlc-agent-template
```

### Update to the latest version

```bash
cd ~/.claude/skills/sdlc-agent-template && git pull
```

## Usage

**Interactive:**

```
/sdlc-agent-template
```

The skill asks each input one at a time (project name, description, tech stack, team roles, sprint length, target platform, output dir).

**Config-file (non-interactive):**

```
/sdlc-agent-template ./my-project.yaml
```

See [`inputs-schema.md`](./inputs-schema.md) for the YAML schema and [`examples/webapp-team-of-5/config.yaml`](./examples/webapp-team-of-5/config.yaml) for a worked example.

Flags:

- `--yes` — skip the final confirm prompt.
- `--force` — overwrite a non-empty target directory.

## What it generates

- Role-based **sub-agents** for Claude Code and/or Codex.
- Helper skills: `requirement-author`, `design-author`, `task-implementer`, `code-reviewer`, `test-writer`, `test-runner`, `deploy-runner`, `incident-responder`, `sprint-planner`, `sprint-retrospective`, `task-progress-update`, `sdlc-graph-export`, `risk-review`, `docs-updater`, `adr-writer`, `git-workflow`.
- A typed-markdown doc model under `docs/sdlc/` whose frontmatter doubles as a dependency graph (requirements → designs → tasks → tests → deployments → operations).
- `scripts/sdlc-graph.js` — walks the docs and emits `_graph.json` + `_graph.mmd`.
- `scripts/sdlc-propagate.js` — propagates `status:` changes across linked docs.
- `.claude/settings.snippet.json` — opt-in PostToolUse hook that runs propagation automatically on every doc edit.

## Development

```bash
npm test
```

Runs the node test suite under `tests/`.

## Version

Current: **0.1.0**. The version is stamped into every generated project's `docs/sdlc/_meta.yaml`. See [`CHANGELOG.md`](./CHANGELOG.md) for history.

## License

[MIT](./LICENSE) — Apaichon Punopas.
