import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { emit } from '../lib/emit.js';
import { validateConfig, loadConfigFile } from '../lib/validate-config.js';

const SKILL_DIR = '/Users/apaichon/libra/agentic-template/.claude/skills/sdlc-agent-template';
const EXAMPLE = join(SKILL_DIR, 'examples/webapp-team-of-5/config.yaml');

test('end-to-end: example config generates a complete project tree', () => {
  const raw = loadConfigFile(EXAMPLE);
  const { ok, config, errors } = validateConfig(raw);
  if (!ok) throw new Error('config invalid: ' + errors.join(', '));

  const outDir = mkdtempSync(join(tmpdir(), 'e2e-')) + '/proj';
  emit({
    config: { ...config, output_dir: outDir },
    templatesRoot: join(SKILL_DIR, 'templates'),
    outputDir: outDir
  });

  // Shared
  assert.ok(existsSync(join(outDir, 'README.md')));
  assert.ok(existsSync(join(outDir, 'CONVENTIONS.md')));
  assert.ok(existsSync(join(outDir, '.gitignore')));
  assert.ok(existsSync(join(outDir, 'docs/sdlc/_templates/requirement.md')));
  assert.ok(existsSync(join(outDir, 'docs/sdlc/requirements/.gitkeep')));
  assert.ok(existsSync(join(outDir, 'scripts/sdlc-graph.js')));
  assert.ok(existsSync(join(outDir, 'scripts/sdlc-propagate.js')));
  assert.ok(existsSync(join(outDir, 'scripts/next-id.js')));

  // Claude
  assert.ok(existsSync(join(outDir, '.claude/agents/pm-agent.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/architect-agent.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/backend-dev-agent-1.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/backend-dev-agent-2.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/frontend-dev-agent.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/qa-agent.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/devops-agent.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/docs-agent.md')));
  assert.ok(existsSync(join(outDir, '.claude/agents/sdlc-orchestrator.md')));
  assert.ok(existsSync(join(outDir, '.claude/skills/sprint-retrospective/SKILL.md')));
  assert.ok(existsSync(join(outDir, '.claude/skills/task-progress-update/SKILL.md')));
  assert.ok(existsSync(join(outDir, '.claude/hooks/sdlc-propagate.sh')));
  assert.ok(existsSync(join(outDir, '.claude/settings.snippet.json')));

  // Codex
  assert.ok(existsSync(join(outDir, 'AGENTS.md')));
  assert.ok(existsSync(join(outDir, 'agents/pm-agent.md')));
  assert.ok(existsSync(join(outDir, 'agents/backend-dev-agent-1.md')));

  // Placeholders were substituted
  const readme = readFileSync(join(outDir, 'README.md'), 'utf8');
  assert.match(readme, /chore-tracker/);
  assert.match(readme, /TypeScript, Next.js, Postgres, Vercel/);
  assert.match(readme, /total: 5/);

  // Agent placeholders substituted
  const pm = readFileSync(join(outDir, '.claude/agents/pm-agent.md'), 'utf8');
  assert.match(pm, /PM Agent — chore-tracker/);
});
