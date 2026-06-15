// {{PLACEHOLDER}} substitution. Single-pass (no recursion). Arrays render as ", "-joined.

const RE = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

export function substitute(text, values, opts = {}) {
  const missing = [];
  const replaced = text.replace(RE, (full, key) => {
    if (!(key in values)) {
      missing.push(key);
      return full;
    }
    const v = values[key];
    if (Array.isArray(v)) return v.join(', ');
    if (v === null || v === undefined) return '';
    return String(v);
  });
  if (opts.reportMissing) return { text: replaced, missing: Array.from(new Set(missing)) };
  return replaced;
}
