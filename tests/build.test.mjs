import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, baseTokens } from '../build/build.mjs';
import { emitCss } from '../build/css.mjs';
import { main } from '../bin/design-foundations.mjs';

const css = () => emitCss(baseTokens());
const goldenPath = new URL('./golden/tokens.css', import.meta.url);

test('golden tokens.css matches', () => {
  if (process.env.UPDATE_GOLDEN) writeFileSync(goldenPath, css());
  assert.equal(css(), readFileSync(goldenPath, 'utf8'));
});

test('output is deterministic and starts with the header', () => {
  assert.equal(css(), css());
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(css().split('\n')[0], `/* design-foundations ${pkg.version} — generated, do not edit */`);
});

test('reduced-motion block reassigns --df-motion-transition-push-*', () => {
  const out = css();
  const start = out.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.ok(start > 0);
  const block = out.slice(start, out.indexOf('\n}\n', start));
  assert.match(block, /--df-motion-transition-push-duration: 200ms;/);
  assert.match(block, /--df-motion-transition-push-properties: opacity;/);
  assert.match(block, /--df-motion-transition-push-distance: 0px;/);
  assert.match(block, /--df-motion-spring-smooth-duration: 200ms;/);
});

test('no "animation: none !important" anywhere', () => {
  assert.doesNotMatch(css(), /animation:\s*none\s*!important/);
});

test('body size is 1.0625rem', () => {
  assert.match(css(), /--df-type-body-size: 1\.0625rem;/);
  assert.match(css(), /--df-type-body-leading: 1\.375rem;/);
});

test('springs, materials and dynamic type are emitted', () => {
  const out = css();
  assert.match(out, /--df-motion-spring-smooth: linear\(/);
  assert.match(out, /--df-motion-ease-standard: cubic-bezier\(0\.4, 0, 0\.2, 1\);/);
  assert.match(out, /--df-motion-transition-push-easing: var\(--df-motion-spring-smooth\);/);
  assert.match(out, /@media \(prefers-reduced-transparency: reduce\)/);
  assert.match(out, /@supports not \(\(backdrop-filter: blur\(1px\)\) or \(-webkit-backdrop-filter: blur\(1px\)\)\)/);
  assert.match(out, /@supports \(font: -apple-system-body\)\s*\{\s*html\.df-dynamic-type\s*\{\s*font: -apple-system-body;/);
});

test('dynamic type redefines type sizes as pt/17 rem under html.df-dynamic-type', () => {
  const block = css().match(/@supports \(font: -apple-system-body\) \{([\s\S]*?)\n\}/)[1];
  assert.match(block, /html\.df-dynamic-type \{[^}]*font: -apple-system-body;/);
  assert.match(block, /--df-type-body-size: 1rem;/);
  assert.match(block, /--df-type-body-leading: 1\.2941rem;/);
  assert.match(block, /--df-type-caption2-size: 0\.6471rem;/);
  assert.match(block, /--df-type-large-title-size: 2rem;/);
  assert.doesNotMatch(block, /-weight/);
});

test('tokens.json is flat with resolved values', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-build-'));
  await build({ out: dir });
  const json = JSON.parse(readFileSync(join(dir, 'tokens.json'), 'utf8'));
  assert.equal(json['motion.duration.micro'], '100ms');
  const s = json['motion.spring.smooth'];
  assert.equal(s.duration, 0.5);
  assert.equal(s.bounce, 0);
  assert.match(s.easing, /^linear\(/);
  assert.equal(typeof s.settleMs, 'number');
  assert.ok(existsSync(join(dir, 'tokens.css')));
});

test('--project writes project.css next to the file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-proj-'));
  const example = JSON.parse(readFileSync(new URL('../tokens/example.project.tokens.json', import.meta.url), 'utf8'));
  example.tokens = { brand: { gap: { $type: 'dimension', $value: 6 } } };
  const file = join(dir, 'project.tokens.json');
  writeFileSync(file, JSON.stringify(example));
  await build({ out: join(dir, 'dist'), project: file });
  const out = readFileSync(join(dir, 'project.css'), 'utf8');
  assert.match(out, /--df-color-bg-primary:/);
  assert.match(out, /--df-brand-gap: 6px;/);
});

test('copies src/*.js|mjs into dist when present', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-src-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src', 'a.mjs'), 'export {};\n');
  writeFileSync(join(dir, 'src', 'b.txt'), 'x');
  await build({ out: join(dir, 'dist'), srcDir: join(dir, 'src') });
  assert.ok(existsSync(join(dir, 'dist', 'a.mjs')));
  assert.ok(!existsSync(join(dir, 'dist', 'b.txt')));
});

test('CLI build exits 0; a broken project file exits 2', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-cli-'));
  assert.equal(await main(['build']), 0);
  const bad = join(dir, 'bad.json');
  writeFileSync(bad, '{not json');
  const err = console.error;
  console.error = () => {};
  try {
    assert.equal(await main(['build', '--project', bad, '--out', join(dir, 'o')]), 2);
  } finally {
    console.error = err;
  }
});

test('role tokens emit CSS vars and the shorthand', () => {
  const out = css();
  assert.match(out, /--df-type-role-body: 400 0\.9375rem\/1\.25rem var\(--df-type-font-family-default\);/);
  assert.match(out, /--df-type-role-title: 700 1\.75rem\/2\.125rem var\(--df-type-font-family-default\);/);
  assert.match(out, /--df-type-role-body-size: 0\.9375rem;/);
  assert.match(out, /--df-type-role-body-leading: 1\.25rem;/);
  assert.match(out, /--df-type-role-body-weight: 400;/);
  assert.match(out, /--df-type-role-body-tracking: 0em;/);
  assert.match(out, /--df-type-role-body-transform: none;/);
  assert.match(out, /--df-type-role-label-tracking: 0\.06em;/);
  assert.match(out, /--df-type-role-label-transform: uppercase;/);
  const dyn = out.match(/@supports \(font: -apple-system-body\) \{([\s\S]*?)\n\}/)[1];
  assert.doesNotMatch(dyn, /type-role/);
});

test('build copies text-audit.mjs to dist', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-ta-'));
  await build({ out: dir });
  assert.ok(existsSync(join(dir, 'text-audit.mjs')));
});
