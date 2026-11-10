// Base tokens and the per-project build (`build --project`). Kept free of `yaml` so the
// checker and `build --project` run in an installed copy without the rules toolchain.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTokens, resolveTokens, TokenError } from './tokens.mjs';
import { emitColorCss } from './color.mjs';
import { emitCss } from './css.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_DIR = join(ROOT, 'tokens', 'base');

export function baseTokens() {
  const files = readdirSync(BASE_DIR).filter((f) => f.endsWith('.tokens.json')).sort();
  return resolveTokens(loadTokens(files.map((f) => join(BASE_DIR, f))));
}

export function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new TokenError(`cannot load ${path}: ${e.message}`, path);
  }
}

export const roleSchema = () => readJson(join(ROOT, 'tokens', 'roles.schema.json'));

/** Writes project.css next to the project colour file (colour roles + its optional DTCG `tokens`). */
export function buildProject(project) {
  const proj = readJson(project);
  let css = emitColorCss(proj, roleSchema());
  if (proj.tokens) css += emitCss(resolveTokens(proj.tokens), { header: false });
  const outFile = join(dirname(resolve(project)), 'project.css');
  writeFileSync(outFile, css);
  return outFile;
}
