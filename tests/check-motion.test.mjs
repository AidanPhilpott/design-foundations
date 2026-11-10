import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { getChecks } from '../check/index.mjs';
import { evaluate } from '../check/core.mjs';
import { REDUCED_MOTION_RULE_IDS } from '../check/reduced-motion.mjs';

function run(files, config = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'df-motion-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  const cfg = { include: ['**/*.{css,html,js,jsx}'], checks: { 'reduced-motion': 'error' }, motionCalls: ['flyTo', 'flyToBounds', 'scrollTo'], ...config };
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify(cfg));
  return evaluate(join(dir, 'design-foundations.config.json'));
}
const found = (r) => r.findings.filter((f) => f.check === 'reduced-motion');
const snips = (r) => found(r).map((f) => f.snippet);

test('registers with MOT-05, MOT-08, MOT-09, MOT-10', () => {
  assert.deepEqual(getChecks().find((c) => c.id === 'reduced-motion').ruleIds, ['MOT-05', 'MOT-08', 'MOT-09', 'MOT-10']);
  assert.deepEqual(REDUCED_MOTION_RULE_IDS, ['MOT-05', 'MOT-08', 'MOT-09', 'MOT-10']);
});

test('flags raw flyTo in a file without motion.js', () => {
  const r = run({ 'app.js': 'function go(map) {\n  map.flyTo([1, 2], 14);\n}\n' });
  assert.deepEqual(snips(r), ['map.flyTo(']);
  assert.equal(found(r)[0].line, 2);
});

test('passes camera() from motion.js; flyTo inside a prefersReducedMotion-aware function with the import passes', () => {
  const ok = run({ 'app.js': "import { camera } from './motion.js';\nfunction go(map) {\n  camera(map, [1, 2], 14);\n}\n" });
  assert.deepEqual(found(ok), []);
  const guarded = run({ 'app.js': "import { prefersReducedMotion } from '../dist/motion.js';\nfunction go(map) {\n  if (prefersReducedMotion()) map.setView([1, 2], 14);\n  else map.flyTo([1, 2], 14);\n}\n" });
  assert.deepEqual(found(guarded), []);
  const importOnly = run({ 'app.js': "import { camera } from './motion.js';\nmap.flyTo([1, 2], 14);\n" });
  assert.deepEqual(snips(importOnly), ['map.flyTo(']);
  const noImport = run({ 'app.js': 'function go(map) {\n  if (prefersReducedMotion()) return;\n  map.flyTo([1, 2], 14);\n}\n' });
  assert.equal(found(noImport).length, 1);
});

test('HTML: module script src motion.js and inline scripts count; strings, comments and definitions do not', () => {
  const html = '<script type="module" src="/dist/motion.js"></script>\n<script type="module">\n  function go(m) {\n    if (prefersReducedMotion()) return;\n    m.flyTo([1, 2], 12);\n  }\n</script>\n';
  assert.deepEqual(found(run({ 'p.html': html })), []);
  const bare = run({ 'p.html': '<script>\n  map.flyTo([1, 2], 12);\n</script>\n' });
  assert.deepEqual(snips(bare), ['map.flyTo(']);
  assert.equal(found(bare)[0].line, 2);
  const inert = run({
    'a.js': [
      "const msg = 'call map.flyTo(x) to move';",
      '// map.flyTo(y)',
      'class M { flyTo(a, b) { return a + b; } }',
      'function flyToBounds(a) { return a; }',
      'const o = { scrollTo(x) { return x; } };',
    ].join('\n'),
  });
  assert.deepEqual(found(inert), []);
});

test('flags infinite pulse with no reduced rule', () => {
  const r = run({ 'a.css': '.pulse {\n  animation: pulse var(--df-motion-duration-long) var(--df-motion-ease-standard) infinite;\n}\n.spin { animation-iteration-count: infinite; }\n' });
  assert.deepEqual(snips(r), ['animation: pulse var(--df-motion-duration-long) var(--df-motion-ease-standard) infinite', 'animation-iteration-count: infinite']);
});

test('passes infinite pulse with a reduced rule (any file, whitespace-insensitive)', () => {
  const r = run({
    'a.css': '.a   .pulse { animation: pulse var(--df-motion-duration-long) infinite; }\n.b { animation-iteration-count: infinite; }\n.c { animation: x var(--df-d) infinite; }\n.d { animation: y var(--df-d) infinite; }',
    'b.css': '@media (prefers-reduced-motion: reduce) {\n  .a\n .pulse { animation: none; }\n  .b { animation-iteration-count: 1; }\n  .c { animation-play-state: paused; }\n}',
  });
  assert.deepEqual(snips(r), ['animation: y var(--df-d) infinite']);
});

test('flags blanket kill, with or without !important', () => {
  const r = run({ 'a.css': '@media (prefers-reduced-motion: reduce) {\n  *, *::before { animation: none !important; }\n  * { transition: none; }\n  .x { animation: none; }\n}' });
  assert.deepEqual(snips(r), ['animation: none !important', 'transition: none']);
});

test("flags behavior: 'smooth' and scroll-behavior: smooth", () => {
  const r = run({
    'a.js': "window.scrollTo({ top: 0, behavior: 'smooth' });\nconst s = \"behavior: 'smooth'\";\nfunction up() {\n  if (prefersReducedMotion()) return;\n  el.scrollIntoView({ behavior: \"smooth\" });\n}\n",
    'a.css': 'html { scroll-behavior: smooth; }\n@media (prefers-reduced-motion: no-preference) { body { scroll-behavior: smooth; } }',
  });
  assert.deepEqual(snips(r).sort(), ["behavior: 'smooth'", 'scroll-behavior: smooth', 'window.scrollTo('].sort());
});

test('non-token transitions and animations are flagged; tokens, 0, none, reduced blocks and tokenFiles are not', () => {
  const r = run({
    'a.css': [
      '.a { transition: opacity .2s ease; }',
      '.b { transition: opacity var(--df-motion-transition-feedback-duration) var(--df-motion-transition-feedback-easing); }',
      '.c { transition: none; animation: 0s; }',
      '.d { animation: spin 1s linear; }',
      '.e { transition-duration: 120ms; }',
      '@media (prefers-reduced-motion: reduce) { .a { transition: opacity .1s linear; } }',
    ].join('\n'),
    'tokens.css': ':root { --df-x: 1s; }\n.t { transition: all .3s ease; }',
  }, { tokenFiles: ['tokens.css'] });
  assert.deepEqual(r.findings.filter((f) => f.check === 'reduced-motion').map((f) => f.line), [1, 4, 5]);
});

test('reads <style> blocks and style attributes', () => {
  const r = run({ 'p.html': '<style>\n.x { animation: p 1s infinite; }\n</style>\n<div style="transition: all .2s ease"></div>' });
  assert.deepEqual(found(r).map((f) => f.line).sort(), [2, 2, 4]);
});

test('each finding kind carries only its own rule id', () => {
  const r = run({
    'a.css': '.a { transition: all .2s ease; }\n.p { animation: x var(--df-d) infinite; }\nhtml { scroll-behavior: smooth; }\n@media (prefers-reduced-motion: reduce) { * { animation: none; } }',
    'a.js': 'map.flyTo([1, 2], 3);',
  });
  const ids = Object.fromEntries(found(r).map((f) => [f.snippet, f.ruleIds]));
  assert.deepEqual(ids['transition: all .2s ease'], ['MOT-05']);
  assert.deepEqual(ids['animation: x var(--df-d) infinite'], ['MOT-08']);
  assert.deepEqual(ids['scroll-behavior: smooth'], ['MOT-09']);
  assert.deepEqual(ids['map.flyTo('], ['MOT-09']);
  assert.deepEqual(ids['animation: none'], ['MOT-10']);
});

test('infinite animation inside a no-preference media block is not a finding', () => {
  const r = run({ 'a.css': '@media (prefers-reduced-motion: no-preference) { .p { animation: x var(--df-d) infinite; } }' });
  assert.deepEqual(found(r), []);
});

test('expression-bodied arrow with prefersReducedMotion guard and motion.js import passes', () => {
  const src = "import { prefersReducedMotion } from './motion.js';\nconst go = (m) => prefersReducedMotion() ? m.setView(1) : m.flyTo(1);\nconst h = m => prefersReducedMotion() ? 0 : m.flyTo(2);\n";
  assert.deepEqual(found(run({ 'a.js': src })), []);
  assert.equal(found(run({ 'a.js': "import { camera } from './motion.js';\nconst go = (m) => m.flyTo(1);\n" })).length, 1);
});

test('a file named motion.js is skipped', () => {
  assert.deepEqual(found(run({ 'src/motion.js': 'export function camera(map) { map.flyTo([1, 2], 3); }\n' })), []);
});

test('classic or module <script src=...motion(.global).js> (with query) routes HTML through motion.js', () => {
  const inline = '<script>\n  function go(m) {\n    if (prefersReducedMotion()) return;\n    m.flyTo([1, 2], 12);\n  }\n</script>\n';
  for (const tag of [
    '<script src="/dist/motion.global.js"></script>',
    '<script src="vendor/motion.global.js?v=3"></script>',
    '<script type="module" src="/dist/motion.js?v=3"></script>',
    '<script src="motion.js"></script>',
  ]) assert.deepEqual(found(run({ 'p.html': tag + '\n' + inline })), [], tag);
  const other = run({ 'p.html': '<script src="/dist/notmotion.js.map"></script>\n' + inline });
  assert.deepEqual(snips(other), ['m.flyTo(']);
});

test('JS referencing DFMotion. counts as using motion.js; strings and comments do not', () => {
  const ok = "function go(m) {\n  if (DFMotion.prefersReducedMotion()) m.setView(1);\n  else m.flyTo(1);\n}\n";
  assert.deepEqual(found(run({ 'app.js': ok })), []);
  const fake = "// DFMotion.camera\nconst s = 'DFMotion.camera';\nfunction go(m) {\n  if (prefersReducedMotion()) return;\n  m.flyTo(1);\n}\n";
  assert.deepEqual(snips(run({ 'app.js': fake })), ['m.flyTo(']);
  assert.deepEqual(found(run({ 'app.js': 'DFMotion.camera(map, [1, 2], { zoom: 12 });\n' })), []);
});

test('motion.global.js itself is exempt like motion.js', () => {
  assert.deepEqual(found(run({ 'dist/motion.global.js': 'map.flyTo(1);\n' })), []);
});
