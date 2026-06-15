#!/usr/bin/env node
// Returns the next free zero-padded ID for a given SDLC artifact type by scanning the docs/sdlc/<dir>/ folder.
// Usage: node scripts/next-id.js <type>
// Types: requirement|design|task|test|deployment|operation|adr|sprint

import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MAP = {
  requirement: { dir: 'requirements', prefix: 'REQ' },
  design:      { dir: 'designs',      prefix: 'DES' },
  task:        { dir: 'tasks',        prefix: 'TASK' },
  test:        { dir: 'tests',        prefix: 'TEST' },
  deployment:  { dir: 'deployments',  prefix: 'DEP' },
  operation:   { dir: 'operations',   prefix: 'OPS' },
  adr:         { dir: 'adrs',         prefix: 'ADR' },
  sprint:      { dir: 'sprints',      prefix: 'SPRINT' }
};

const PAD = 4;

const type = process.argv[2];
if (!type || !MAP[type]) {
  console.error('Usage: node scripts/next-id.js <type>');
  console.error('Types: ' + Object.keys(MAP).join('|'));
  process.exit(2);
}

const { dir, prefix } = MAP[type];
const base = join('docs', 'sdlc', dir);
let max = 0;
try {
  for (const f of readdirSync(base)) {
    const m = f.match(new RegExp(`^${prefix}-(\\d+)`));
    if (m) max = Math.max(max, Number(m[1]));
  }
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}
const next = (max + 1).toString().padStart(PAD, '0');
process.stdout.write(`${prefix}-${next}\n`);
