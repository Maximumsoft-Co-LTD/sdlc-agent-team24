import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandRoleFile } from '../lib/role-expand.js';

test('single-count role emits one file, no suffix', () => {
  const out = expandRoleFile('agents/__ROLE__-dev-agent.md',
    [{ role: 'backend', count: 1 }]);
  assert.deepEqual(out, [
    { path: 'agents/backend-dev-agent.md', role: 'backend', index: 1, suffix: '' }
  ]);
});

test('multi-count role emits N files with -N suffix', () => {
  const out = expandRoleFile('agents/__ROLE__-dev-agent.md',
    [{ role: 'backend', count: 2 }]);
  assert.deepEqual(out, [
    { path: 'agents/backend-dev-agent-1.md', role: 'backend', index: 1, suffix: '-1' },
    { path: 'agents/backend-dev-agent-2.md', role: 'backend', index: 2, suffix: '-2' }
  ]);
});

test('multiple roles expand independently', () => {
  const out = expandRoleFile('agents/__ROLE__-dev-agent.md',
    [{ role: 'backend', count: 2 }, { role: 'frontend', count: 1 }]);
  assert.equal(out.length, 3);
  assert.deepEqual(out.map(o => o.path), [
    'agents/backend-dev-agent-1.md',
    'agents/backend-dev-agent-2.md',
    'agents/frontend-dev-agent.md'
  ]);
});

test('files without __ROLE__ are returned unchanged with role=null', () => {
  const out = expandRoleFile('agents/qa-agent.md',
    [{ role: 'backend', count: 2 }]);
  assert.deepEqual(out, [{ path: 'agents/qa-agent.md', role: null, index: 1, suffix: '' }]);
});
