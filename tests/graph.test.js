import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT = '/Users/apaichon/libra/agentic-template/.claude/skills/sdlc-agent-template/templates/shared/scripts/sdlc-graph.js';

function writeDoc(dir, name, fm) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) lines.push(`${k}: [${v.join(', ')}]`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---', '# Body', '');
  writeFileSync(join(dir, name), lines.join('\n'));
}

test('graph exporter writes _graph.json and _graph.mmd with correct counts', () => {
  const proj = mkdtempSync(join(tmpdir(), 'proj-'));
  const base = join(proj, 'docs', 'sdlc');
  mkdirSync(join(base, 'requirements'), { recursive: true });
  mkdirSync(join(base, 'tasks'), { recursive: true });

  writeDoc(join(base, 'requirements'), 'REQ-0001.md', { id: 'REQ-0001', type: 'requirement', title: 'Login', status: 'approved' });
  writeDoc(join(base, 'tasks'), 'TASK-0001.md', { id: 'TASK-0001', type: 'task', title: 'JWT', status: 'in_progress', implements: ['REQ-0001'] });
  writeDoc(join(base, 'tasks'), 'TASK-0002.md', { id: 'TASK-0002', type: 'task', title: 'UI', status: 'proposed', implements: ['REQ-0001'], blocked_by: ['TASK-0001'] });

  execFileSync('node', [SCRIPT], { cwd: proj });

  const g = JSON.parse(readFileSync(join(base, '_graph.json'), 'utf8'));
  assert.equal(g.nodes.length, 3);
  assert.equal(g.edges.length, 3); // 2 implements + 1 blocked_by

  const mmd = readFileSync(join(base, '_graph.mmd'), 'utf8');
  assert.match(mmd, /graph LR/);
  assert.match(mmd, /REQ_0001/);
});

test('graph exporter flags dangling edges but does not fail', () => {
  const proj = mkdtempSync(join(tmpdir(), 'proj2-'));
  const base = join(proj, 'docs', 'sdlc', 'tasks');
  mkdirSync(base, { recursive: true });
  writeDoc(base, 'TASK-0001.md', { id: 'TASK-0001', type: 'task', title: 'X', status: 'proposed', implements: ['REQ-9999'] });

  const out = execFileSync('node', [SCRIPT], { cwd: proj, encoding: 'utf8' });
  // script exits 0; stderr warns about dangling
  assert.match(out, /1 nodes/);
});
