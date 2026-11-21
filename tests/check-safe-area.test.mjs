import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { getChecks } from '../check/index.mjs';
import { evaluate } from '../check/core.mjs';
import { SAFE_AREA_RULE_IDS } from '../check/safe-area.mjs';

function run(files, config = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'df-safe-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  const cfg = { include: ['**/*.{css,html,js,jsx,tsx}'], checks: { 'safe-area': 'error' }, ...config };
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify(cfg));
  return evaluate(join(dir, 'design-foundations.config.json'));
}
const safe = (r) => r.findings.filter((f) => f.check === 'safe-area');
const COVER = '<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
const ALL = 'padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);';

test('registers as LAY-01', () => {
  const c = getChecks().find((m) => m.id === 'safe-area');
  assert.deepEqual(c.ruleIds, ['LAY-01']);
  assert.deepEqual(SAFE_AREA_RULE_IDS, ['LAY-01']);
});

test('viewport-fit=cover with no safe-area insets anywhere is flagged on the meta line', () => {
  const r = run({ 'index.html': COVER, 'a.css': '.bar { padding: 16px; }' });
  const f = safe(r);
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'index.html');
  assert.equal(f[0].line, 3);
  assert.deepEqual(f[0].ruleIds, ['LAY-01']);
  assert.match(f[0].message, /viewport-fit=cover/);
  assert.match(f[0].message, /top, right, bottom, left/);
  assert.match(f[0].snippet, /viewport-fit=cover/);
});

test('all four insets used in a stylesheet: clean', () => {
  assert.equal(safe(run({ 'index.html': COVER, 'a.css': `.screen { ${ALL} }` })).length, 0);
});

test('insets may be spread across files, longhands, calc(), max() and inline styles', () => {
  const r = run({
    'index.html': `${COVER}<div style="padding-top: max(16px, env(safe-area-inset-top))"></div>`,
    'a.css': '.bar { padding-bottom: calc(var(--df-space-4) + env(safe-area-inset-bottom, 0px)); }',
    'b.css': '.x { margin-left: env( safe-area-inset-left ); margin-right: env(safe-area-inset-right); }',
  });
  assert.equal(safe(r).length, 0);
});

test('only the missing sides are named', () => {
  const r = run({ 'index.html': COVER, 'a.css': '.bar { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }' });
  const f = safe(r);
  assert.equal(f.length, 1);
  assert.match(f[0].message, /right, left/);
  assert.doesNotMatch(f[0].message, /top|bottom/);
});

test('JS style objects and Tailwind arbitrary values count', () => {
  const r = run({
    'index.html': COVER,
    'Bar.jsx': [
      'export const Bar = () => <nav style={{ paddingTop: "env(safe-area-inset-top)" }}',
      '  className="pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]" />;',
    ].join('\n'),
  });
  assert.equal(safe(r).length, 0);
});

test('safe-area-max-inset and the legacy constant() spelling count', () => {
  const r = run({ 'index.html': COVER, 'a.css': '.s { padding: constant(safe-area-inset-top) env(safe-area-max-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }' });
  assert.equal(safe(r).length, 0);
});

test('a mention in a comment is not padding', () => {
  const r = run({ 'index.html': COVER, 'a.css': `/* TODO: ${ALL} */\n.s { padding: 0; }` });
  assert.equal(safe(r).length, 1);
});

test('no viewport-fit=cover: nothing to check, even without insets', () => {
  const r = run({
    'index.html': '<meta name="viewport" content="width=device-width, initial-scale=1">',
    'other.html': '<meta name="viewport" content="width=device-width, viewport-fit=auto">',
    'a.css': '.bar { padding: 16px; }',
  });
  assert.equal(safe(r).length, 0);
});

test('attribute order, quotes, spacing and case do not matter', () => {
  const r = run({ 'index.html': "<META content='Width=device-width,Viewport-Fit = cover' NAME=viewport>" });
  assert.equal(safe(r).length, 1);
});

test('Next.js viewport export (viewportFit: "cover") is detected', () => {
  const r = run({ 'app/layout.tsx': "export const viewport = {\n  width: 'device-width',\n  viewportFit: 'cover',\n};\n" });
  const f = safe(r);
  assert.equal(f.length, 1);
  assert.equal(f[0].file, 'app/layout.tsx');
  assert.equal(f[0].line, 3);
});

test('each cover declaration gets its own finding', () => {
  const r = run({ 'a.html': COVER, 'b.html': COVER });
  assert.deepEqual(safe(r).map((f) => f.file), ['a.html', 'b.html']);
});

test('df-allow with a reason suppresses it', () => {
  const html = '<!-- df-allow safe-area: full-screen map, controls are positioned by the map library -->\n<meta name="viewport" content="viewport-fit=cover">';
  const r = run({ 'index.html': html });
  assert.equal(safe(r).length, 0);
  assert.equal(r.suppressed.filter((f) => f.check === 'safe-area').length, 1);
});

test('defaults to warn when the config does not name it', () => {
  const r = run({ 'index.html': COVER }, { checks: {} });
  assert.equal(safe(r)[0].severity, 'warn');
});
