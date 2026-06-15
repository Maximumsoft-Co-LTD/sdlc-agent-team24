import { readFileSync } from 'node:fs';
import { parse as parseFM } from './frontmatter.js';

const PLATFORMS = ['claude', 'codex', 'both'];
const STAGES = ['requirements', 'design', 'code', 'testing', 'deployment', 'operations'];
const SENIORITY = ['junior', 'mid', 'senior'];

export function validateConfig(raw) {
  const errors = [];
  const cfg = { ...raw };

  const req = (k) => { if (cfg[k] === undefined || cfg[k] === null) errors.push(`${k}: required`); };
  req('project_name'); req('description'); req('tech_stack'); req('team_roles'); req('target_platform'); req('output_dir');

  if (cfg.project_name && !/^[a-z][a-z0-9-]*$/.test(cfg.project_name)) {
    errors.push('project_name: must match ^[a-z][a-z0-9-]*$');
  }
  if (cfg.tech_stack && (!Array.isArray(cfg.tech_stack) || cfg.tech_stack.length === 0)) {
    errors.push('tech_stack: must be a non-empty list');
  }
  if (cfg.team_roles) {
    if (!Array.isArray(cfg.team_roles) || cfg.team_roles.length === 0) {
      errors.push('team_roles: must be a non-empty list');
    } else {
      for (const [i, r] of cfg.team_roles.entries()) {
        if (!r || typeof r !== 'object') { errors.push(`team_roles[${i}]: must be an object`); continue; }
        if (typeof r.role !== 'string' || !r.role) errors.push(`team_roles[${i}].role: required string`);
        if (typeof r.count !== 'number' || !Number.isInteger(r.count) || r.count < 1) {
          errors.push(`team_roles[${i}].count: must be integer >= 1`);
        }
        if (r.seniority !== undefined && !SENIORITY.includes(r.seniority)) {
          errors.push(`team_roles[${i}].seniority: must be one of ${SENIORITY.join('|')}`);
        }
      }
    }
  }
  if (cfg.target_platform && !PLATFORMS.includes(cfg.target_platform)) {
    errors.push(`target_platform: must be one of ${PLATFORMS.join('|')}`);
  }
  if (cfg.sprint_length_days !== undefined) {
    if (!Number.isInteger(cfg.sprint_length_days) || cfg.sprint_length_days < 1 || cfg.sprint_length_days > 60) {
      errors.push('sprint_length_days: must be integer 1..60');
    }
  } else {
    cfg.sprint_length_days = 14;
  }
  if (cfg.sdlc_stages !== undefined) {
    if (!Array.isArray(cfg.sdlc_stages) || cfg.sdlc_stages.length === 0) {
      errors.push('sdlc_stages: must be a non-empty list');
    } else {
      for (const s of cfg.sdlc_stages) {
        if (!STAGES.includes(s)) errors.push(`sdlc_stages: unknown value "${s}"`);
      }
    }
  } else {
    cfg.sdlc_stages = [...STAGES];
  }
  if (cfg.risk_levels !== undefined) {
    if (!Array.isArray(cfg.risk_levels) || cfg.risk_levels.length === 0) {
      errors.push('risk_levels: must be a non-empty list');
    }
  } else {
    cfg.risk_levels = ['low', 'medium', 'high', 'critical'];
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, config: cfg };
}

// Minimal YAML loader for our config shape (re-uses the frontmatter parser, which handles
// the subset of YAML we use: flat scalars, inline lists, inline maps, and "- {…}" block lists).
export function loadConfigFile(path) {
  const raw = readFileSync(path, 'utf8');
  // Convert "team_roles:\n  - {role: backend, count: 2}\n" style into something our parser handles.
  // Strategy: replace each `- {...}` block-list line under a known key with an inline list.
  return parseYamlConfig(raw);
}

export function parseYamlConfig(raw) {
  const lines = raw.split('\n');
  const out = {};
  let currentKey = null;
  let listBuf = [];

  const flushList = () => {
    if (currentKey && listBuf.length > 0) {
      out[currentKey] = listBuf.map(item => parseFM(`x: ${item}`).x);
      listBuf = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line || line.trimStart().startsWith('#')) continue;
    const indentMatch = rawLine.match(/^(\s*)/);
    const indent = indentMatch[1].length;
    if (indent === 0) {
      flushList();
      currentKey = null;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
      if (!m) continue;
      const [, key, val] = m;
      if (val === '') {
        currentKey = key;
      } else {
        // single line; reuse frontmatter parser for value
        out[key] = parseFM(`${key}: ${val}`)[key];
      }
    } else {
      // expect "- value"
      const m = line.trim().match(/^-\s*(.*)$/);
      if (m) listBuf.push(m[1]);
    }
  }
  flushList();
  return out;
}

// CLI entrypoint
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node validate-config.js <path-to-config.yaml>');
    process.exit(2);
  }
  const raw = loadConfigFile(path);
  const result = validateConfig(raw);
  if (!result.ok) {
    console.error('Config validation failed:');
    for (const e of result.errors) console.error('  - ' + e);
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(result.config, null, 2) + '\n');
}
