import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../lib/validate-config.js';

const ok = {
  project_name: 'my-app',
  description: 'A test app.',
  tech_stack: ['TypeScript'],
  team_roles: [{ role: 'backend', count: 2 }],
  target_platform: 'both',
  output_dir: './my-app'
};

test('valid config returns ok=true with normalized values', () => {
  const r = validateConfig(ok);
  assert.equal(r.ok, true);
  assert.equal(r.config.sprint_length_days, 14);
  assert.deepEqual(r.config.risk_levels, ['low', 'medium', 'high', 'critical']);
  assert.deepEqual(r.config.sdlc_stages, ['requirements', 'design', 'code', 'testing', 'deployment', 'operations']);
});

test('rejects project_name with capitals', () => {
  const r = validateConfig({ ...ok, project_name: 'MyApp' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /project_name/);
});

test('rejects empty tech_stack', () => {
  const r = validateConfig({ ...ok, tech_stack: [] });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /tech_stack/);
});

test('rejects team_roles with count=0', () => {
  const r = validateConfig({ ...ok, team_roles: [{ role: 'backend', count: 0 }] });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /count/);
});

test('rejects sprint_length_days out of range', () => {
  const r = validateConfig({ ...ok, sprint_length_days: 999 });
  assert.equal(r.ok, false);
});

test('rejects bad target_platform', () => {
  const r = validateConfig({ ...ok, target_platform: 'gemini' });
  assert.equal(r.ok, false);
});

test('rejects unknown sdlc_stages entry', () => {
  const r = validateConfig({ ...ok, sdlc_stages: ['requirements', 'magic'] });
  assert.equal(r.ok, false);
});
