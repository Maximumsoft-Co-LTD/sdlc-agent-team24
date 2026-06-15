import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, serialize, split } from '../lib/frontmatter.js';

test('split separates frontmatter from body', () => {
  const txt = '---\nid: TASK-0001\ntitle: hello\n---\n# Body\n';
  const { fm, body } = split(txt);
  assert.equal(fm.trim(), 'id: TASK-0001\ntitle: hello');
  assert.equal(body, '# Body\n');
});

test('split returns empty fm when document has no frontmatter', () => {
  const { fm, body } = split('# Just a body\n');
  assert.equal(fm, '');
  assert.equal(body, '# Just a body\n');
});

test('parse handles scalars, lists, and inline maps', () => {
  const fm = `id: TASK-0001
title: Implement JWT
status: in_progress
risk: medium
tags: [auth, security]
implements: [REQ-0007, REQ-0009]
last_run: {date: 2026-06-15, result: pass}
risk_notes: "Token rotation must not break active sessions"`;
  const obj = parse(fm);
  assert.equal(obj.id, 'TASK-0001');
  assert.equal(obj.title, 'Implement JWT');
  assert.deepEqual(obj.tags, ['auth', 'security']);
  assert.deepEqual(obj.implements, ['REQ-0007', 'REQ-0009']);
  assert.deepEqual(obj.last_run, { date: '2026-06-15', result: 'pass' });
  assert.equal(obj.risk_notes, 'Token rotation must not break active sessions');
});

test('serialize round-trips a parsed object', () => {
  const obj = {
    id: 'TASK-0001',
    title: 'Hello',
    tags: ['a', 'b'],
    last_run: { date: '2026-06-15', result: 'pass' }
  };
  const out = serialize(obj);
  const round = parse(out);
  assert.deepEqual(round, obj);
});

test('serialize quotes strings containing special chars', () => {
  const out = serialize({ note: 'has: colon' });
  assert.match(out, /note: "has: colon"/);
});

test('parse treats # as comment', () => {
  const obj = parse('id: TASK-0001\n# comment line\ntitle: hi');
  assert.equal(obj.id, 'TASK-0001');
  assert.equal(obj.title, 'hi');
});
