import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const BIN = join(ROOT, 'bin', 'design-foundations.mjs');

function scratchProject() {
  const dir = mkdtempSync(join(tmpdir(), 'df-cli-'));
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify({ include: ['*.css'], checks: { 'raw-values': 'error' } }));
  writeFileSync(join(dir, 'a.css'), '.a { transition: all .2s; }\n');
  return dir;
}

// Like npm's node_modules/.bin/design-foundations: a symlink to the real file.
function binLink() {
  const dir = mkdtempSync(join(tmpdir(), 'df-bin-'));
  const link = join(dir, 'design-foundations');
  symlinkSync(BIN, link);
  return link;
}

test('CLI runs when started through a symlink (npm .bin / npx)', () => {
  const link = binLink();
  const proj = scratchProject();
  const r = spawnSync(process.execPath, [link, 'check'], { cwd: proj, encoding: 'utf8' });
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stdout, /a\.css:1\s+raw-values/);
  const usage = spawnSync(process.execPath, [link], { encoding: 'utf8' });
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /usage: design-foundations/);
});

// Blocks the `yaml` package as an installed consumer without devDependencies would see it.
const NO_YAML = `data:text/javascript,${encodeURIComponent(`
import { register } from 'node:module';
register('data:text/javascript,' + encodeURIComponent(
  "export async function resolve(s, c, n) { if (s === 'yaml') throw Object.assign(new Error('blocked yaml'), { code: 'ERR_MODULE_NOT_FOUND' }); return n(s, c); }"
));`)}`;

test('check does not need the yaml package', () => {
  const proj = scratchProject();
  const r = spawnSync(process.execPath, ['--import', NO_YAML, BIN, 'check'], { cwd: proj, encoding: 'utf8' });
  assert.doesNotMatch(r.stderr, /blocked yaml/);
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stdout, /raw-values/);
});

test('yaml is a runtime dependency (build and ingest diff load rules)', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.dependencies?.yaml, 'yaml in dependencies');
  assert.equal(pkg.devDependencies?.yaml, undefined);
});

test('build --project writes only project.css (no dist, no docs)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-proj-'));
  const projFile = join(dir, 'colors.json');
  writeFileSync(projFile, JSON.stringify({ roles: { 'label.primary': { light: '#000000', dark: '#ffffff' } } }));
  const before = statSync(join(ROOT, 'dist', 'tokens.css')).mtimeMs;
  const r = spawnSync(process.execPath, ['--import', NO_YAML, BIN, 'build', '--project', projFile], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(dir).sort(), ['colors.json', 'project.css']);
  assert.match(readFileSync(join(dir, 'project.css'), 'utf8'), /--df-color-label-primary/);
  assert.equal(statSync(join(ROOT, 'dist', 'tokens.css')).mtimeMs, before, 'dist untouched');
});

test('build: a flag where a value belongs is a usage error', () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-opt-'));
  for (const args of [['--out', '--project', 'x.json'], ['--out'], ['--project']]) {
    const r = spawnSync(process.execPath, [BIN, 'build', ...args], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 2, `${args.join(' ')}: ${r.stderr}`);
    assert.match(r.stderr, /usage: design-foundations build/);
  }
  assert.equal(existsSync(join(dir, '--project')), false);
});

test('sync through a symlink writes the files', () => {
  const link = binLink();
  const proj = mkdtempSync(join(tmpdir(), 'df-sync-'));
  const r = spawnSync(process.execPath, [link, 'sync', '--to', 'vendor/df'], { cwd: proj, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(proj, 'vendor', 'df', 'tokens.css')));
});
