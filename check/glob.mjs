// Tiny glob matcher: `**`, `*`, `?`, `{a,b}`. Paths are relative with forward slashes.
const cache = new Map();

function expandBraces(p) {
  const m = /\{([^{}]*)\}/.exec(p);
  if (!m) return [p];
  return m[1].split(',').flatMap((alt) => expandBraces(p.slice(0, m.index) + alt + p.slice(m.index + m[0].length)));
}

function toRegex(p) {
  let re = '';
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c === '*') {
      if (p[i + 1] === '*') {
        i++;
        if (p[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^$()|[\]\\{}]/g, '\\$&');
  }
  return re;
}

export const normalizePath = (p) => p.replace(/\\/g, '/').replace(/^(\.\/)+/, '');

export function matchGlob(pattern, path) {
  let re = cache.get(pattern);
  if (!re) {
    re = new RegExp(`^(?:${expandBraces(normalizePath(pattern)).map(toRegex).join('|')})$`);
    cache.set(pattern, re);
  }
  return re.test(normalizePath(path));
}
