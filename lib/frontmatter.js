// Tiny YAML-frontmatter parser for the subset we use.
// Supports: flat scalars, inline lists [a, b], inline maps {k: v, k2: v2},
// quoted strings, and # comments. No nested blocks, no anchors, no multi-line strings.

const FENCE = '---';

export function split(text) {
  if (!text.startsWith(FENCE + '\n') && !text.startsWith(FENCE + '\r\n')) {
    return { fm: '', body: text };
  }
  const rest = text.slice(text.indexOf('\n') + 1);
  const end = rest.indexOf('\n' + FENCE);
  if (end < 0) return { fm: '', body: text };
  const fm = rest.slice(0, end);
  let body = rest.slice(end + 1 + FENCE.length);
  if (body.startsWith('\n')) body = body.slice(1);
  return { fm, body };
}

export function parse(fm) {
  const obj = {};
  if (!fm) return obj;
  for (const rawLine of fm.split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    obj[key] = parseValue(rawValue);
  }
  return obj;
}

function parseValue(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner, ',').map(s => parseValue(s.trim()));
  }
  if (v.startsWith('{') && v.endsWith('}')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return {};
    const out = {};
    for (const part of splitTopLevel(inner, ',')) {
      const idx = part.indexOf(':');
      if (idx < 0) continue;
      const k = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      out[k] = parseValue(val);
    }
    return out;
  }
  if (/^-?\d+$/.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  return v;
}

// Split on `sep` at depth 0 (ignoring nested [] and {}).
function splitTopLevel(s, sep) {
  const out = [];
  let depth = 0;
  let buf = '';
  for (const ch of s) {
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') depth--;
    else if (ch === sep && depth === 0) {
      out.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf) out.push(buf);
  return out;
}

export function serialize(obj) {
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`${k}: ${serializeValue(v)}`);
  }
  return lines.join('\n') + '\n';
}

function serializeValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return '[' + v.map(serializeValue).join(', ') + ']';
  if (typeof v === 'object') {
    const parts = Object.entries(v).map(([k, vv]) => `${k}: ${serializeValue(vv)}`);
    return '{' + parts.join(', ') + '}';
  }
  // string: quote if it contains :, [, {, #, leading space, or a quote
  const s = String(v);
  if (/[:\[\]{}#"']/.test(s) || s !== s.trim()) {
    return '"' + s.replace(/"/g, '\\"') + '"';
  }
  return s;
}
