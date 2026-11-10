// `design-foundations sync`: copy dist/ (and optionally the Claude skill) into a project that vendors them.
// Writes a .df-manifest.json so a later sync can remove files it wrote before but no longer ships,
// and never touches anything else in the target directory.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, unlinkSync, rmdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = '.df-manifest.json';

/** Relative forward-slash paths of every file under dir. */
function listFiles(dir, prefix = '') {
  const out = [];
  for (const e of readdirSync(join(dir, prefix), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...listFiles(dir, rel));
    else if (e.isFile() && e.name !== MANIFEST) out.push(rel);
  }
  return out;
}

function readManifest(to) {
  try {
    const m = JSON.parse(readFileSync(join(to, MANIFEST), 'utf8'));
    return Array.isArray(m.files) ? m.files.filter((f) => typeof f === 'string') : [];
  } catch {
    return [];
  }
}

const inside = (root, p) => {
  const rel = relative(root, p);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
};

/** Copy `files` (relative to src) into `to`, plus `extra` {rel: text}; delete stale files named by the previous manifest. */
function syncTree(src, to, files, extra, version) {
  const root = resolve(to);
  mkdirSync(root, { recursive: true });
  const previous = readManifest(root);
  const written = [];
  for (const rel of files) {
    const dest = join(root, ...rel.split('/'));
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(src, ...rel.split('/')), dest);
    written.push(rel);
  }
  for (const [rel, text] of Object.entries(extra)) {
    writeFileSync(join(root, rel), text);
    written.push(rel);
  }
  const keep = new Set(written);
  for (const rel of previous) {
    if (keep.has(rel)) continue;
    const victim = resolve(root, ...rel.split('/'));
    if (!inside(root, victim) || rel.split(/[\\/]/).includes('..')) continue; // a tampered manifest can't reach outside `to`
    try {
      if (statSync(victim).isFile()) unlinkSync(victim);
    } catch { /* already gone */ }
    for (let d = dirname(victim); inside(root, d); d = dirname(d)) {
      try { rmdirSync(d); } catch { break; } // only removes directories that are now empty
    }
  }
  writeFileSync(join(root, MANIFEST), JSON.stringify({ version, files: written.sort() }, null, 2) + '\n');
}

/**
 * sync({to, skill?, version, distDir?, skillDir?}): dist/* -> to/ with to/VERSION;
 * with `skill`, plugin/skills/design-foundations -> <skill>/design-foundations.
 */
export async function sync({ to, skill, version, distDir = join(ROOT, 'dist'), skillDir = join(ROOT, 'plugin', 'skills', 'design-foundations') }) {
  if (!to) throw new Error('sync: "to" is required');
  if (!existsSync(distDir)) throw new Error(`sync: ${distDir} does not exist; run \`design-foundations build\` first`);
  syncTree(distDir, to, listFiles(distDir).filter((f) => f !== 'VERSION'), { VERSION: `${version}\n` }, version);
  if (skill) {
    if (!existsSync(skillDir)) throw new Error(`sync: ${skillDir} does not exist`);
    syncTree(skillDir, join(skill, 'design-foundations'), listFiles(skillDir), {}, version);
  }
}
