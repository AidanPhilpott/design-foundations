// DTCG token loader + resolver. No dependencies.
import { readFileSync } from 'node:fs';

export class TokenError extends Error {
  constructor(message, path) {
    super(message);
    this.name = 'TokenError';
    this.path = path;
  }
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isToken = (n) => isObj(n) && ('$value' in n || '$extensions' in n);

function merge(a, b) {
  if (!isObj(a) || !isObj(b) || isToken(a) || isToken(b)) return structuredClone(b);
  const out = { ...structuredClone(a) };
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? merge(out[k], v) : structuredClone(v);
  return out;
}

/** Deep-merge DTCG files in order (later wins; a token is replaced whole). */
export function loadTokens(paths) {
  let tree = {};
  for (const p of paths) {
    let json;
    try {
      json = JSON.parse(readFileSync(p, 'utf8'));
    } catch (e) {
      throw new TokenError(`cannot load ${p}: ${e.message}`, p);
    }
    tree = merge(tree, json);
  }
  return tree;
}

const ALIAS = /^\{([^{}]+)\}$/;

/**
 * Flatten to Map<dottedPath, {type, value, ext?, description?}>, resolving {a.b.c}
 * aliases (also nested inside composite values). An alias to a token with no
 * value but a df extension (spring) resolves, when nested, to a copy of that ext.
 */
export function resolveTokens(tree) {
  const raw = new Map();
  (function walk(node, path, inherited) {
    const type = node.$type ?? inherited;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$') || !isObj(v)) continue;
      const p = path ? `${path}.${k}` : k;
      if (isToken(v)) raw.set(p, { node: v, type: v.$type ?? type });
      else walk(v, p, v.$type ?? type);
    }
  })(tree, '', tree.$type);

  const done = new Map();
  const busy = [];

  function lookup(ref, from) {
    if (!raw.has(ref)) throw new TokenError(`unresolved alias {${ref}} in ${from}`, from);
    return resolve(ref);
  }

  function sub(v, from) {
    if (typeof v === 'string') {
      const m = ALIAS.exec(v);
      if (!m) return v;
      const t = lookup(m[1], from);
      return t.value == null && t.ext ? structuredClone(t.ext) : t.value;
    }
    if (Array.isArray(v)) return v.map((x) => sub(x, from));
    if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sub(x, from)]));
    return v;
  }

  function resolve(path) {
    if (done.has(path)) return done.get(path);
    if (busy.includes(path)) {
      throw new TokenError(`alias cycle: ${[...busy.slice(busy.indexOf(path)), path].join(' -> ')}`, path);
    }
    busy.push(path);
    try {
      const { node, type } = raw.get(path);
      let value = node.$value ?? null;
      let ext = node.$extensions?.df;
      let t = type;
      const m = typeof value === 'string' ? ALIAS.exec(value) : null;
      if (m) {
        const target = lookup(m[1], path);
        value = target.value;
        ext = ext ?? target.ext;
        t = t ?? target.type;
      } else {
        value = sub(value, path);
      }
      const out = { type: t, value };
      if (ext !== undefined) out.ext = ext;
      if (node.$description !== undefined) out.description = node.$description;
      done.set(path, out);
      return out;
    } finally {
      busy.pop();
    }
  }

  for (const p of raw.keys()) resolve(p);
  return done;
}
