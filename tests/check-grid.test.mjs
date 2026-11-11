import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { getChecks } from '../check/index.mjs';
import { evaluate } from '../check/core.mjs';
import { GRID_RULE_IDS, gridReasons, gridClassReason } from '../check/grid.mjs';

function run(files, config = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'df-grid-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  const cfg = { include: ['**/*.{css,html,js,jsx}'], checks: { grid: 'error' }, ...config };
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify(cfg));
  return evaluate(join(dir, 'design-foundations.config.json'));
}
const grid = (r) => r.findings.filter((f) => f.check === 'grid');
const snips = (r) => grid(r).map((f) => f.snippet);

test('registers as LAY-07', () => {
  const c = getChecks().find((m) => m.id === 'grid');
  assert.deepEqual(c.ruleIds, ['LAY-07']);
  assert.deepEqual(GRID_RULE_IDS, ['LAY-07']);
});

test('CSS file: off-grid spacing, sizes and radii are flagged, with line numbers', () => {
  const r = run({
    'a.css': [
      '.a { padding: 6px 8px; }',
      '.b { margin: 0 -10px; }',
      '.c { gap: 12px; row-gap: 14px; }',
      '.d { top: 3px; left: 4px; }',
      '.e { width: 18px; min-height: 22px; max-width: 320px; }',
      '.f { border-radius: 10px; border-top-left-radius: 5px; }',
      '.g { inset: 2px 7px; }',
      '.h { flex-basis: 30px; }',
    ].join('\n'),
  });
  assert.deepEqual(snips(r), [
    'padding: 6px 8px',
    'margin: 0 -10px',
    'row-gap: 14px',
    'top: 3px',
    'width: 18px',
    'min-height: 22px',
    'border-radius: 10px',
    'border-top-left-radius: 5px',
    'inset: 2px 7px',
    'flex-basis: 30px',
  ]);
  assert.equal(grid(r)[0].line, 1);
  assert.deepEqual(grid(r)[0].ruleIds, ['LAY-07']);
  assert.match(grid(r)[0].message, /6px/);
});

test('on-grid values, zero, 2px half step, negatives and tokens pass', () => {
  const r = run({
    'a.css': [
      '.a { padding: 0 4px 8px 12px; margin: -4px auto; gap: 2px; }',
      '.b { width: 44px; height: 100%; max-width: 90vw; min-height: 100dvh; }',
      '.c { padding: var(--df-space-3) calc(var(--df-space-2) * 2); top: env(safe-area-inset-top); }',
      '.d { width: calc(100% - 16px); height: 0; padding: 0.25rem 1rem; }',
      '.e { border-radius: 50%; border-radius: 9999px; border-radius: 999px; width: 2.5em; }',
      '.f { margin: auto; width: fit-content; height: auto; inset: 0; }',
    ].join('\n'),
  });
  assert.deepEqual(snips(r), []);
});

test('1px and 0.5px on a checked property are findings; borders, outlines and line-height are exempt', () => {
  const r = run({
    'a.css': [
      '.a { height: 1px; }',
      '.b { width: 0.5px; }',
      '.c { border: 1px solid red; border-width: 3px; outline: 1px solid; outline-offset: 3px; line-height: 22px; }',
      '.d { font-size: 13px; letter-spacing: 1px; transform: translateY(3px); box-shadow: 0 1px 3px #000; }',
      '.e { --pin-size: 18px; }',
    ].join('\n'),
  });
  assert.deepEqual(snips(r), ['height: 1px', 'width: 0.5px']);
  assert.match(grid(r)[0].message, /border/);
});

test('rem is converted at 16px', () => {
  const r = run({ 'a.css': '.a { padding: 0.375rem; }\n.b { padding: 0.5rem; }\n.c { margin: 1.375rem; }\n.d { gap: 0.125rem; }\n' });
  assert.deepEqual(snips(r), ['padding: 0.375rem', 'margin: 1.375rem']);
  assert.match(grid(r)[0].message, /6px/);
});

test('calc literals are checked, var fallbacks too', () => {
  const r = run({
    'a.css': '.a { width: calc(100% - 6px); }\n.b { height: calc(100vh - 56px); }\n.c { padding: var(--x, 10px); }\n.d { padding: var(--x, 8px); }\n',
  });
  assert.deepEqual(snips(r), ['width: calc(100% - 6px)', 'padding: var(--x, 10px)']);
});

test('HTML <style> block and style attribute', () => {
  const r = run({
    'a.html': '<style>\n.a { padding: 6px; }\n.ok { padding: 8px; }\n</style>\n<div style="margin: 10px; width: 16px"></div>\n<div style="height: 14px"></div>\n',
  });
  assert.deepEqual(snips(r), ['padding: 6px', 'margin: 10px', 'height: 14px']);
  assert.deepEqual(grid(r).map((f) => f.line), [2, 5, 6]);
});

test('JS style object: strings and bare numbers (React px), dynamic values skipped', () => {
  const r = run({
    'a.jsx': [
      'export const A = () => <div style={{ padding: 6, margin: "10px 8px", width: 16, height: n, gap: `${n}px`, zIndex: 3, opacity: 1, lineHeight: 22, flex: 1 }} />;',
      'export const B = () => <div style={{ paddingTop: 8, borderRadius: 10, top: "3px", minWidth: 44 }} />;',
    ].join('\n'),
  });
  assert.deepEqual(snips(r), ['padding: 6px', 'margin: 10px 8px', 'border-radius: 10px', 'top: 3px']);
});

test('Tailwind arbitrary values on spacing, size and radius utilities', () => {
  const r = run({
    'a.html': [
      '<div class="p-[6px] px-[8px] w-[18px] -mt-[10px] rounded-[10px] md:gap-[14px] hover:top-[3px] min-h-[22px] size-[30px]"></div>',
      '<div class="p-[8px] w-[44px] rounded-[9999px] h-[calc(100%-16px)] text-[13px] leading-[22px] border-[1px] bg-[#fff] w-[50%] top-[var(--x)] h-[100dvh] p-4 w-[0.5rem]"></div>',
      '<div class="w-[calc(100%-6px)] p-[0.375rem]"></div>',
    ].join('\n'),
  });
  assert.deepEqual(snips(r), ['p-[6px]', 'w-[18px]', '-mt-[10px]', 'rounded-[10px]', 'md:gap-[14px]', 'hover:top-[3px]', 'min-h-[22px]', 'size-[30px]', 'w-[calc(100%-6px)]', 'p-[0.375rem]']);
});

test('helpers: gridReasons / gridClassReason', () => {
  assert.deepEqual(gridReasons('padding', '6px 8px'), ['6px']);
  assert.deepEqual(gridReasons('padding', '8px'), []);
  assert.deepEqual(gridReasons('font-size', '13px'), []);
  assert.deepEqual(gridReasons('border-radius', '1000px'), []);
  assert.equal(gridClassReason('p-[8px]'), null);
  assert.match(gridClassReason('p-[6px]'), /6px/);
});

test('df-allow grid: with a reason suppresses; without a reason it does not and is reported', () => {
  const r = run({
    'a.css': [
      '.a { padding: 6px; } /* df-allow grid: matches the vendor widget */',
      '/* df-allow grid: legacy iframe size */',
      '.b { width: 18px; }',
      '.c { margin: 10px; } /* df-allow grid: */',
    ].join('\n'),
  });
  assert.equal(grid(r).length, 2);
  assert.ok(snips(r).includes('margin: 10px'));
  assert.equal(r.suppressed.filter((f) => f.check === 'grid').length, 2);
  assert.ok(grid(r).some((f) => f.message === 'df-allow needs a reason'));
});

test('baseline-style fingerprints are stable across line moves', () => {
  const a = run({ 'a.css': '.a { padding: 6px; }\n' });
  const b = run({ 'a.css': '\n\n.a { padding: 6px; }\n' });
  assert.equal(grid(a)[0].fingerprint, grid(b)[0].fingerprint);
});

test('severity: default warn, off disables', () => {
  assert.equal(grid(run({ 'a.css': '.a{padding:6px}' }, { checks: {} }))[0].severity, 'warn');
  assert.equal(grid(run({ 'a.css': '.a{padding:6px}' }, { checks: { grid: 'off' } })).length, 0);
});
