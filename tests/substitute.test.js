import { test } from 'node:test';
import assert from 'node:assert/strict';
import { substitute } from '../lib/substitute.js';

test('replaces a single placeholder', () => {
  assert.equal(substitute('hi {{NAME}}', { NAME: 'Ada' }), 'hi Ada');
});

test('replaces multiple placeholders', () => {
  const out = substitute('{{A}}-{{B}}-{{A}}', { A: 'x', B: 'y' });
  assert.equal(out, 'x-y-x');
});

test('renders list values as comma-joined when used in body', () => {
  const out = substitute('Tech: {{TECH_STACK_LIST}}', { TECH_STACK_LIST: ['TS', 'Next.js'] });
  assert.equal(out, 'Tech: TS, Next.js');
});

test('leaves unknown placeholders untouched and reports them', () => {
  const { text, missing } = substitute('hi {{NAME}} and {{UNKNOWN}}', { NAME: 'Ada' }, { reportMissing: true });
  assert.equal(text, 'hi Ada and {{UNKNOWN}}');
  assert.deepEqual(missing, ['UNKNOWN']);
});

test('escapes nothing — placeholders are literal substitution', () => {
  assert.equal(substitute('{{X}}', { X: 'has `backticks` and {{not_recursive}}' }),
                          'has `backticks` and {{not_recursive}}');
});
