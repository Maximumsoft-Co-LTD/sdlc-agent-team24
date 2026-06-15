import { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, existsSync, renameSync, cpSync, rmSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import { substitute } from './substitute.js';
import { expandRoleFile } from './role-expand.js';

export function emit({ config, templatesRoot, outputDir, force = false }) {
  if (existsSync(outputDir) && readdirSync(outputDir).length > 0 && !force) {
    throw new Error(`output_dir is non-empty: ${outputDir}. Pass force=true to overwrite.`);
  }

  const staging = mkdtempSync(join(tmpdir(), 'sdlc-stage-'));
  const values = buildValues(config);

  // Always emit shared/
  walkAndEmit(join(templatesRoot, 'shared'), staging, '', values, config);

  // Platform-specific
  const platforms = config.target_platform === 'both'
    ? ['claude', 'codex']
    : [config.target_platform];

  for (const p of platforms) {
    const dest = p === 'claude' ? join(staging, '.claude') : staging; // codex puts AGENTS.md at root
    walkAndEmit(join(templatesRoot, p), dest, '', values, config);
  }

  // Atomic move (or merge if force)
  if (force && existsSync(outputDir)) {
    // copy contents, overwriting; then remove staging
    cpSync(staging, outputDir, { recursive: true, force: true });
    rmSync(staging, { recursive: true, force: true });
  } else {
    if (existsSync(outputDir)) rmSync(outputDir, { recursive: true });
    mkdirSync(dirname(outputDir), { recursive: true });
    renameSync(staging, outputDir);
  }
}

function walkAndEmit(srcRoot, destRoot, relPath, values, config) {
  const src = join(srcRoot, relPath);
  if (!existsSync(src)) return;
  for (const name of readdirSync(src)) {
    const childRel = relPath ? join(relPath, name) : name;
    const childSrc = join(src, name);
    const st = statSync(childSrc);
    if (st.isDirectory()) {
      walkAndEmit(srcRoot, destRoot, childRel, values, config);
    } else {
      emitOneFile(childSrc, destRoot, childRel, values, config);
    }
  }
}

function emitOneFile(srcPath, destRoot, relPath, values, config) {
  const devRoles = config.team_roles.filter(r => isDevRole(r.role));
  const expansions = relPath.includes('__ROLE__')
    ? expandRoleFile(relPath, devRoles.length ? devRoles : [{ role: 'dev', count: 1 }])
    : [{ path: relPath, role: null, index: 1, suffix: '' }];

  const raw = readFileSync(srcPath, 'utf8');
  for (const exp of expansions) {
    const perFileValues = { ...values, ROLE: exp.role ?? '', INDEX: exp.index, ROLE_SUFFIX: exp.suffix };
    const text = substitute(raw, perFileValues);
    const outPath = join(destRoot, exp.path);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, text);
  }
}

function isDevRole(role) {
  return ['backend', 'frontend', 'mobile', 'fullstack'].includes(role);
}

function buildValues(config) {
  return {
    PROJECT_NAME: config.project_name,
    PROJECT_DESCRIPTION: config.description,
    TECH_STACK_LIST: config.tech_stack,
    TEAM_SIZE: config.team_roles.reduce((n, r) => n + r.count, 0),
    SPRINT_LENGTH_DAYS: config.sprint_length_days,
    TARGET_PLATFORM: config.target_platform,
    SDLC_STAGES_LIST: config.sdlc_stages,
    RISK_LEVELS_LIST: config.risk_levels,
    ROLES_SUMMARY: config.team_roles.map(r => `${r.role}×${r.count}`).join(', ')
  };
}

export function hashTree(dir) {
  const out = {};
  const walk = (rel) => {
    const abs = join(dir, rel);
    for (const name of readdirSync(abs)) {
      const childRel = rel ? join(rel, name) : name;
      const st = statSync(join(abs, name));
      if (st.isDirectory()) walk(childRel);
      else {
        const buf = readFileSync(join(abs, name));
        out[childRel.split(sep).join('/')] = createHash('sha256').update(buf).digest('hex');
      }
    }
  };
  walk('');
  return out;
}
