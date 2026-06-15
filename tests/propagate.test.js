import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT = '/Users/apaichon/libra/agentic-template/.claude/skills/sdlc-agent-template/templates/shared/scripts/sdlc-propagate.js';

function doc(fm, body = '# Body\n') {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) lines.push(`${k}: [${v.join(', ')}]`);
    else if (typeof v === 'object') lines.push(`${k}: {${Object.entries(v).map(([kk, vv]) => `${kk}: ${vv}`).join(', ')}}`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---', body);
  return lines.join('\n');
}

test('task->done with failing verified_by reverts to blocked', () => {
  const proj = mkdtempSync(join(tmpdir(), 'prop-'));
  mkdirSync(join(proj, 'docs/sdlc/tasks'), { recursive: true });
  mkdirSync(join(proj, 'docs/sdlc/tests'), { recursive: true });
  writeFileSync(join(proj, 'docs/sdlc/tests/TEST-0001.md'),
    doc({ id: 'TEST-0001', type: 'test', title: 't', status: 'done', last_run: { date: '2026-06-15', result: 'fail' } }));
  const taskPath = join(proj, 'docs/sdlc/tasks/TASK-0001.md');
  writeFileSync(taskPath,
    doc({ id: 'TASK-0001', type: 'task', title: 'x', status: 'done', verified_by: ['TEST-0001'] }));

  execFileSync('node', [SCRIPT, taskPath], { cwd: proj });

  const t = readFileSync(taskPath, 'utf8');
  assert.match(t, /status: blocked/);
  assert.match(t, /> note: reverted to blocked/);
});

test('task->blocked propagates blocked to its blocks list', () => {
  const proj = mkdtempSync(join(tmpdir(), 'prop2-'));
  mkdirSync(join(proj, 'docs/sdlc/tasks'), { recursive: true });
  const a = join(proj, 'docs/sdlc/tasks/TASK-0001.md');
  const b = join(proj, 'docs/sdlc/tasks/TASK-0002.md');
  writeFileSync(a, doc({ id: 'TASK-0001', type: 'task', title: 'A', status: 'blocked', blocks: ['TASK-0002'] }));
  writeFileSync(b, doc({ id: 'TASK-0002', type: 'task', title: 'B', status: 'proposed' }));

  execFileSync('node', [SCRIPT, a], { cwd: proj });

  assert.match(readFileSync(b, 'utf8'), /status: blocked/);
});

test('requirement->cancelled cancels implementing tasks that are not done', () => {
  const proj = mkdtempSync(join(tmpdir(), 'prop3-'));
  mkdirSync(join(proj, 'docs/sdlc/requirements'), { recursive: true });
  mkdirSync(join(proj, 'docs/sdlc/tasks'), { recursive: true });
  const r = join(proj, 'docs/sdlc/requirements/REQ-0001.md');
  const t1 = join(proj, 'docs/sdlc/tasks/TASK-0001.md');
  const t2 = join(proj, 'docs/sdlc/tasks/TASK-0002.md');
  writeFileSync(r, doc({ id: 'REQ-0001', type: 'requirement', title: 'R', status: 'cancelled' }));
  writeFileSync(t1, doc({ id: 'TASK-0001', type: 'task', title: 'A', status: 'in_progress', implements: ['REQ-0001'] }));
  writeFileSync(t2, doc({ id: 'TASK-0002', type: 'task', title: 'B', status: 'done', implements: ['REQ-0001'] }));

  execFileSync('node', [SCRIPT, r], { cwd: proj });

  assert.match(readFileSync(t1, 'utf8'), /status: cancelled/);
  assert.match(readFileSync(t2, 'utf8'), /status: done/);
});

test('deployment->done stamps deployed_in on artifact tasks and bumps updated', () => {
  const proj = mkdtempSync(join(tmpdir(), 'prop4-'));
  mkdirSync(join(proj, 'docs/sdlc/deployments'), { recursive: true });
  mkdirSync(join(proj, 'docs/sdlc/tasks'), { recursive: true });
  const d = join(proj, 'docs/sdlc/deployments/DEP-0001.md');
  const t = join(proj, 'docs/sdlc/tasks/TASK-0001.md');
  writeFileSync(d, doc({ id: 'DEP-0001', type: 'deployment', title: 'D', status: 'done', artifacts: ['TASK-0001'] }));
  writeFileSync(t, doc({ id: 'TASK-0001', type: 'task', title: 'X', status: 'done', deployed_in: [], updated: '2020-01-01' }));

  execFileSync('node', [SCRIPT, d], { cwd: proj });

  const out = readFileSync(t, 'utf8');
  assert.match(out, /deployed_in: \[DEP-0001\]/);
  assert.doesNotMatch(out, /updated: 2020-01-01/);
});
