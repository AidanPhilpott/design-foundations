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

export async function build({ out = 'dist', project, srcDir = join(ROOT, 'src') } = {}) {
  const resolved = baseTokens();
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'tokens.css'), emitCss(resolved));
  writeFileSync(join(out, 'tokens.json'), JSON.stringify(flatten(resolved), null, 2) + '\n');

  if (existsSync(srcDir)) {
    for (const f of readdirSync(srcDir).filter((n) => /\.(m?js)$/.test(n)).sort()) {
      copyFileSync(join(srcDir, f), join(out, f));
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
