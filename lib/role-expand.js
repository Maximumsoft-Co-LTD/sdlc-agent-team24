// Expand a single template file path with __ROLE__ in it to one path per role × count.
// Files without __ROLE__ pass through with role=null.

const TOKEN = '__ROLE__';

export function expandRoleFile(templatePath, devRoles) {
  if (!templatePath.includes(TOKEN)) {
    return [{ path: templatePath, role: null, index: 1, suffix: '' }];
  }
  const out = [];
  for (const { role, count } of devRoles) {
    if (count === 1) {
      out.push({
        path: templatePath.replaceAll(TOKEN, role),
        role,
        index: 1,
        suffix: ''
      });
    } else {
      for (let i = 1; i <= count; i++) {
        const base = templatePath.replaceAll(TOKEN, role);
        // insert "-i" before the extension
        const dot = base.lastIndexOf('.');
        const withSuffix = dot >= 0 ? `${base.slice(0, dot)}-${i}${base.slice(dot)}` : `${base}-${i}`;
        out.push({ path: withSuffix, role, index: i, suffix: `-${i}` });
      }
    }
  }
  return out;
}
