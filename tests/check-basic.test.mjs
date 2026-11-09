import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { getChecks } from '../check/index.mjs';
import { evaluate } from '../check/core.mjs';
import { RAW_VALUES_RULE_IDS } from '../check/raw-values.mjs';
import { TEXT_FLOOR_RULE_IDS } from '../check/text-floor.mjs';
import { FOCUS_RULE_IDS } from '../check/focus.mjs';

function run(files, config = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'df-basic-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  const cfg = { include: ['**/*.{css,html,js,jsx}'], checks: { 'raw-values': 'error', 'text-floor': 'error', focus: 'error' }, ...config };
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify(cfg));
  return evaluate(join(dir, 'design-foundations.config.json'));
}
const by = (r, check) => r.findings.filter((f) => f.check === check);
const snips = (r, check) => by(r, check).map((f) => f.snippet);

test('modules register with the rule ids Task 12 will write', () => {
  const ids = Object.fromEntries(getChecks().map((c) => [c.id, c.ruleIds]));
  assert.deepEqual(ids['raw-values'], ['MOT-11', 'COL-02', 'TYP-03']);
  assert.deepEqual(ids['text-floor'], ['TYP-01', 'ACC-02']);
  assert.deepEqual(ids.focus, ['ACC-05']);
  assert.deepEqual(RAW_VALUES_RULE_IDS, ids['raw-values']);
  assert.deepEqual(TEXT_FLOOR_RULE_IDS, ids['text-floor']);
  assert.deepEqual(FOCUS_RULE_IDS, ids.focus);
});

test('raw-values flags transition: all .2s ease', () => {
  const r = run({ 'a.css': '.a {\n  color: var(--x);\n  transition: all .2s ease;\n}\n' });
  const f = by(r, 'raw-values');
  assert.equal(f.length, 1);
  assert.equal(f[0].snippet, 'transition: all .2s ease');
  assert.equal(f[0].line, 3);
  assert.deepEqual(f[0].ruleIds, ['MOT-11', 'COL-02', 'TYP-03']);
  assert.match(f[0].message, /duration/);
  assert.match(f[0].message, /easing/);
});

test('raw-values flags easings, colours (hex, rgb, hsl, named) and font-size literals', () => {
  const r = run({
    'a.css': [
      '.a { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }',
      '.b { animation: spin 1s linear infinite; }',
      '.c { color: #fff; background: rgba(0, 0, 0, .5); border-color: hsl(10 20% 30%); }',
      '.d { fill: tomato; }',
      '.e { font-size: 14px; }',
      '.f { transition: opacity 120ms ease-in-out; }',
      '.g { box-shadow: 0 1px 2px #0003; }',
    ].join('\n'),
  });
  const s = snips(r, 'raw-values');
  assert.deepEqual(s, [
    'transition-timing-function: cubic-bezier(0.2, 0, 0, 1)',
    'animation: spin 1s linear infinite',
    'color: #fff',
    'background: rgba(0, 0, 0, .5)',
    'border-color: hsl(10 20% 30%)',
    'fill: tomato',
    'font-size: 14px',
    'transition: opacity 120ms ease-in-out',
    'box-shadow: 0 1px 2px #0003',
  ]);
});

test('raw-values allows var(), 0, keywords, transparent, currentColor and custom properties', () => {
  const r = run({
    'a.css': [
      ':root { --my-dur: 2s; --my-bg: #123456; --my-size: 9px; }',
      '.a { transition: opacity var(--df-motion-transition-fade-duration) var(--df-motion-transition-fade-easing); }',
      '.b { transition: none; animation: none; transition-duration: 0s; transition-delay: 0ms; }',
      '.c { color: inherit; background: transparent; border-color: currentColor; fill: currentcolor; }',
      '.d { font-size: var(--df-type-body-size); font-size: inherit; font-size: 0; }',
      '.e { font-size: calc(var(--df-type-body-size) * 1.2); color: var(--c, red); }',
      '.f { animation: pulse var(--d) infinite; transition: color var(--d) var(--e); }',
      '.g { margin: 0; width: 200ms-wide; }',
    ].join('\n'),
  });
  assert.deepEqual(snips(r, 'raw-values'), []);
});

test('raw-values ignores literals in comments, strings and url(#id)', () => {
  const r = run({
    'a.css': [
      '/* transition: all .2s ease; color: #fff; */',
      '.a { content: "#fff 2s ease"; background: url(#grad); }',
      ".b { background: url('x.png#abc123'); color: var(--c); /* font-size: 9px */ }",
      '.c { fill: url(#abc); mask: url(data:image/svg+xml;utf8,<svg fill=\'%23fff\'/>); }',
      '.d { font-family: "Orange Sans", tomato-font, sans-serif; }',
    ].join('\n'),
    'b.html': '<!-- <p style="color: #fff"> -->\n<p style="background: url(#grad)">x</p>\n<script>const s = "transition: all 2s";</script>',
  });
  assert.deepEqual(snips(r, 'raw-values'), []);
});

test('raw-values ignores values in tokenFiles', () => {
  const css = ':root { --t: 2s; }\n.x { transition: all .2s ease; color: #fff; }\n';
  const r = run({ 'tokens.css': css, 'app.css': css }, { tokenFiles: ['tokens.css'] });
  assert.deepEqual([...new Set(by(r, 'raw-values').map((f) => f.file))], ['app.css']);
});

test('raw-values scans html style attributes and <style> blocks with real line numbers', () => {
  const html = '<p>\n<div style="color: #abc; margin: 0">x</div>\n<style>\n.q {\n  transition: all 1s ease;\n}\n</style>';
  const r = run({ 'p.html': html });
  const f = by(r, 'raw-values');
  assert.deepEqual(f.map((x) => [x.snippet, x.line]), [['color: #abc', 2], ['transition: all 1s ease', 5]]);
});

test('raw-values scans JS style objects (strings and numbers) and style attrs inside template strings', () => {
  const js = [
    'const a = <div style={{ color: "red", transition: "all .2s ease", fontSize: 12, margin: 0, width: w }} />;',
    'const b = <div style={{ color: "var(--c)", fontSize: size }} />;',
    "el.innerHTML = `<i style=\"top: 1px; color: #fff\"></i>`;",
  ].join('\n');
  const r = run({ 'a.jsx': js });
  assert.deepEqual(snips(r, 'raw-values'), ['color: red', 'transition: all .2s ease', 'font-size: 12px', 'color: #fff']);
});

test('raw-values flags Tailwind duration-[250ms] and text-[#fff]', () => {
  const js = [
    'const a = <div className="p-4 duration-[250ms] hover:text-[#fff] bg-[#123456] text-[11px] ease-[cubic-bezier(.2,0,0,1)]" />;',
    'const b = <div className="duration-[var(--d)] text-[length:var(--s)] duration-300 text-accent bg-[url(/x.png)] ease-[var(--e)] ${x}" />;',
  ].join('\n');
  const html = '<div class="delay-[1s] md:text-[rgb(1,2,3)]"></div>';
  const r = run({ 'a.jsx': js, 'p.html': html });
  assert.deepEqual(
    by(r, 'raw-values').map((f) => f.snippet),
    ['duration-[250ms]', 'hover:text-[#fff]', 'bg-[#123456]', 'text-[11px]', 'ease-[cubic-bezier(.2,0,0,1)]', 'delay-[1s]', 'md:text-[rgb(1,2,3)]'],
  );
});

test('raw-values snippets are stable under reformatting (fingerprints)', () => {
  const a = run({ 'a.css': '.a{transition:all .2s ease}' });
  const b = run({ 'a.css': '\n\n.a {\n  transition:   all\n    .2s ease;\n}' });
  assert.equal(by(a, 'raw-values')[0].snippet, by(b, 'raw-values')[0].snippet);
  assert.equal(by(a, 'raw-values')[0].fingerprint, by(b, 'raw-values')[0].fingerprint);
});

test('raw-values finds a final declaration without a semicolon', () => {
  const r = run({ 'a.css': '.a { color: red; transition: all 1s' });
  assert.deepEqual(snips(r, 'raw-values'), ['color: red', 'transition: all 1s']);
});

test('text-floor flags 10px and 0.6rem, passes 11px', () => {
  const r = run({
    'a.css': ['.a { font-size: 10px; }', '.b { font-size: 0.6rem; }', '.c { font-size: 11px; }', '.d { font-size: 0.6875rem; }', '.e { font: 9px/1.2 sans-serif; }', '.f { font-size: 12px; }'].join('\n'),
  });
  const f = by(r, 'text-floor');
  assert.deepEqual(f.map((x) => [x.snippet, x.line]), [['font-size: 10px', 1], ['font-size: 0.6rem', 2], ['font: 9px/1.2 sans-serif', 5]]);
  assert.deepEqual(f[0].ruleIds, ['TYP-01', 'ACC-02']);
  assert.match(f[1].message, /9\.6px/);
});

test('text-floor handles !important', () => {
  const r = run({ 'a.css': '.a { font-size: 10px !important; }\n.b { font-size: 10px!important; }\n.c { font: 9px/1 x !important; }\n.d { font-size: 12px !important; }' });
  assert.deepEqual(by(r, 'text-floor').map((f) => f.line), [1, 2, 3]);
});

test('text-floor resolves var(--df-type-*-size) through the tokens and ignores unknown vars', () => {
  const r = run({
    'a.css': ['.a { font-size: var(--df-type-caption2-size); }', '.b { font-size: var(--df-type-footnote-size); }', '.c { font-size: var(--unknown); }', '.d { font-size: var(--df-type-large-title-size); }'].join('\n'),
  });
  assert.deepEqual(by(r, 'text-floor'), []);
});

test('text-floor flags a token-sized var below the floor and JS / Tailwind sizes', () => {
  const js = 'const a = <p style={{ fontSize: 10 }} className="text-[9px] text-[12px] text-xs" />;\nconst b = <p style={{ fontSize: "0.5rem" }} />;';
  const r = run({ 'a.jsx': js });
  assert.deepEqual(snips(r, 'text-floor'), ['font-size: 10px', 'text-[9px]', 'font-size: 0.5rem']);
});

test('text-floor ignores comments and applies inside tokenFiles', () => {
  const r = run({ 'a.css': '/* font-size: 8px */ .a { font-size: 8px; }', 't.css': '.t { font-size: 8px; }' }, { tokenFiles: ['t.css'] });
  assert.deepEqual(by(r, 'text-floor').map((f) => f.file), ['a.css', 't.css']);
});

test('focus flags outline:none without focus-visible', () => {
  const r = run({ 'a.css': '.btn { color: var(--c); }\n.btn:focus { outline: none; }\n.link { outline: 0; }\n' });
  const f = by(r, 'focus');
  assert.deepEqual(f.map((x) => [x.snippet, x.line]), [['outline: none', 2], ['outline: 0', 3]]);
  assert.deepEqual(f[0].ruleIds, ['ACC-05']);
});

test('focus passes when .btn:focus-visible exists (any file, whitespace-insensitive)', () => {
  const r = run({
    'a.css': '.btn:focus { outline: none; }\nnav   a { outline: none; }\n',
    'b.css': '.btn:focus-visible { outline: 2px solid var(--df-color-accent); }\nnav\n a:focus-visible { box-shadow: 0 0 0 2px var(--df-color-accent); }',
  });
  assert.deepEqual(by(r, 'focus'), []);
});

test('focus: :focus alone is not a replacement; :not(:focus-visible) does not count; the rule must set something', () => {
  const r = run({
    'a.css': [
      '.a { outline: none; }',
      '.a:focus { outline: 2px solid red; }',
      '.b:focus:not(:focus-visible) { outline: none; }',
      '.b2:focus { outline: none; }',
      '.c:focus-visible { outline: none; }',
      '.d { outline: none; }',
      '.d:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--x); }',
      '.e { outline-style: none; }',
    ].join('\n'),
  });
  assert.deepEqual(by(r, 'focus').map((f) => f.line), [1, 4, 5, 8]);
});

test('focus: a global :focus-visible rule covers everything; comma selectors check each part', () => {
  const ok = run({ 'a.css': 'button, .x { outline: none; }\n:focus-visible { outline: 2px solid var(--c); }' });
  assert.deepEqual(by(ok, 'focus'), []);
  const bad = run({ 'a.css': 'button, .x { outline: none; }\nbutton:focus-visible { outline: 2px solid var(--c); }' });
  assert.equal(by(bad, 'focus').length, 1);
});

test('focus reads <style> blocks and does not flag outline values that show an outline', () => {
  const html = '<style>\n.q { outline: none; }\n.r { outline: 1px solid red; outline-offset: 0; }\n</style>';
  const r = run({ 'p.html': html });
  assert.deepEqual(by(r, 'focus').map((f) => f.line), [2]);
});

test('df-allow suppresses these checks and findings default to the configured severity', () => {
  const r = run({ 'a.css': '/* df-allow raw-values: legacy */\n.a { color: #fff; }\n.b { color: #000; }' });
  assert.equal(r.suppressed.length, 1);
  assert.equal(r.findings.length, 1);
  assert.equal(r.findings[0].severity, 'error');
});

test('focus flags outline: none !important', () => {
  const r = run({ 'a.css': '.a { outline: none !important; }\n.b { outline-style: none!important; }\n.c { outline-width: 0 !important; }\n.d { outline: 2px solid red !important; }' });
  assert.deepEqual(by(r, 'focus').map((f) => f.line), [1, 2, 3]);
});
