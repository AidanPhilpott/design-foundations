// `design-foundations build`: tokens/base -> dist/tokens.css + dist/tokens.json (+ project.css).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTokens, resolveTokens, TokenError } from './tokens.mjs';
import { springCurve } from './spring.mjs';
import { emitColorCss } from './color.mjs';
import { emitCss } from './css.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_DIR = join(ROOT, 'tokens', 'base');

export function baseTokens() {
  const files = readdirSync(BASE_DIR).filter((f) => f.endsWith('.tokens.json')).sort();
  return resolveTokens(loadTokens(files.map((f) => join(BASE_DIR, f))));
}

/** Flat {dotted path: value}; springs carry duration, bounce, easing and settleMs. */
export function flatten(resolved) {
  const out = {};
  for (const p of [...resolved.keys()].sort()) {
    const { type, value, ext } = resolved.get(p);
    out[p] = type === 'spring' ? { ...ext, ...springCurve(ext) } : value;
  }
  return out;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new TokenError(`cannot load ${path}: ${e.message}`, path);
  }
}

const toMs = (v) => (typeof v === 'number' ? v : /ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000);
const num = (v) => (typeof v === 'number' ? v : parseFloat(v));
const bezier = (v) => `cubic-bezier(${v.join(', ')})`;
const easingString = (v) => (Array.isArray(v) ? bezier(v) : typeof v === 'object' ? springCurve(v).easing : String(v));

/** The resolved motion values inlined into dist/motion.js (durations in ms, CSS easing strings). */
export function motionTokens(resolved) {
  const durations = {};
  for (const [p, { type, value }] of resolved) {
    if (type !== 'duration') continue;
    const [, group, key] = p.split('.');
    if (group === 'duration') durations[key] = toMs(value);
    else if (group === 'camera') durations[`camera${key[0].toUpperCase()}${key.slice(1)}`] = toMs(value);
  }
  const side = ({ properties, duration, easing, distance }) => ({
    duration: toMs(duration),
    easing: easingString(easing),
    properties: [...properties],
    ...(distance !== undefined ? { distance: num(distance) } : {}),
  });
  const transitions = {};
  for (const [p, { type, value }] of resolved) {
    if (type === 'transition') transitions[p.split('.').at(-1)] = { normal: side(value.normal), reduced: side(value.reduced) };
  }
  return { durations, transitions };
}

const PLACEHOLDER = '/*__DF_TOKENS__*/null';

export async function build({ out = 'dist', project, srcDir = join(ROOT, 'src') } = {}) {
  const resolved = baseTokens();
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'tokens.css'), emitCss(resolved));
  writeFileSync(join(out, 'tokens.json'), JSON.stringify(flatten(resolved), null, 2) + '\n');

  if (existsSync(srcDir)) {
    for (const f of readdirSync(srcDir).filter((n) => /\.(m?js)$/.test(n)).sort()) {
      const text = readFileSync(join(srcDir, f), 'utf8');
      if (text.includes(PLACEHOLDER)) {
        writeFileSync(join(out, f), text.replace(PLACEHOLDER, () => JSON.stringify(motionTokens(resolved), null, 2)));
      } else {
        copyFileSync(join(srcDir, f), join(out, f));
      }
    }
  }

  if (project) {
    const proj = readJson(project);
    const schema = readJson(join(ROOT, 'tokens', 'roles.schema.json'));
    let css = emitColorCss(proj, schema);
    if (proj.tokens) {
      const tmp = resolveTokens(proj.tokens);
      css += emitCss(tmp, { header: false });
    }
    writeFileSync(join(dirname(resolve(project)), 'project.css'), css);
  }
}
