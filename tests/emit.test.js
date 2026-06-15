import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { emit, hashTree } from '../lib/emit.js';

function setupTemplates() {
  const root = mkdtempSync(join(tmpdir(), 'tpl-'));
  mkdirSync(join(root, 'shared', 'docs'), { recursive: true });
  mkdirSync(join(root, 'claude', 'agents'), { recursive: true });
  writeFileSync(join(root, 'shared', 'README.md'), 'Project: {{PROJECT_NAME}}\nStack: {{TECH_STACK_LIST}}\n');
  writeFileSync(join(root, 'shared', 'docs', '.gitkeep'), '');
  writeFileSync(join(root, 'claude', 'agents', '__ROLE__-dev-agent.md'), '---\nname: {{ROLE}}-dev-{{INDEX}}\n---\nRole: {{ROLE}}\n');
  return root;
}

test('emits shared + claude tree with placeholders and role expansion', () => {
  const tplRoot = setupTemplates();
  const out = mkdtempSync(join(tmpdir(), 'out-'));
  rmSync(out, { recursive: true });

  const cfg = {
    project_name: 'my-app',
    description: 'desc',
    tech_stack: ['TS', 'Next'],
    team_roles: [{ role: 'backend', count: 2 }],
    target_platform: 'claude',
    output_dir: out,
    sprint_length_days: 14,
    sdlc_stages: ['requirements'],
    risk_levels: ['low', 'high']
  };

  emit({ config: cfg, templatesRoot: tplRoot, outputDir: out });

  assert.ok(existsSync(join(out, 'README.md')));
  assert.equal(readFileSync(join(out, 'README.md'), 'utf8'), 'Project: my-app\nStack: TS, Next\n');
  assert.ok(existsSync(join(out, 'docs')));
  assert.ok(existsSync(join(out, '.claude', 'agents', 'backend-dev-agent-1.md')));
  assert.ok(existsSync(join(out, '.claude', 'agents', 'backend-dev-agent-2.md')));
  const a1 = readFileSync(join(out, '.claude', 'agents', 'backend-dev-agent-1.md'), 'utf8');
  assert.match(a1, /name: backend-dev-1/);
  assert.match(a1, /Role: backend/);
});

test('refuses to overwrite non-empty existing output_dir unless force=true', () => {
  const tplRoot = setupTemplates();
  const out = mkdtempSync(join(tmpdir(), 'out-'));
  writeFileSync(join(out, 'something.txt'), 'existing');

  const cfg = {
    project_name: 'my-app', description: 'd', tech_stack: ['TS'],
    team_roles: [{ role: 'backend', count: 1 }],
    target_platform: 'claude', output_dir: out,
    sprint_length_days: 14, sdlc_stages: ['requirements'], risk_levels: ['low']
  };

  assert.throws(() => emit({ config: cfg, templatesRoot: tplRoot, outputDir: out, force: false }), /non-empty/);
  emit({ config: cfg, templatesRoot: tplRoot, outputDir: out, force: true });
  assert.ok(existsSync(join(out, 'README.md')));
});

test('hashTree returns deterministic sha256 map for known content', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hash-'));
  writeFileSync(join(dir, 'a.txt'), 'hello');
  writeFileSync(join(dir, 'b.txt'), 'world');
  const h = hashTree(dir);
  assert.equal(h['a.txt'], '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  assert.equal(h['b.txt'], '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7');
});
