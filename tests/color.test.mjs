import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseColor, contrast, checkPairs, emitColorCss } from '../build/color.mjs';

const schema = JSON.parse(readFileSync(new URL('../tokens/roles.schema.json', import.meta.url), 'utf8'));
const example = JSON.parse(readFileSync(new URL('../tokens/example.project.tokens.json', import.meta.url), 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));
const r2 = (n) => Math.round(n * 100) / 100;

test('#767676 on #ffffff is 4.54', () => assert.equal(r2(contrast('#767676', '#ffffff')), 4.54));
test('#fff on #fff is 1', () => assert.equal(r2(contrast('#fff', '#fff')), 1));
test('#000 on #fff is 21', () => assert.equal(r2(contrast('#000', '#fff')), 21));

test('"#0006" and "rgba(0 0 0 / .4)" parse equal', () => {
  const a = parseColor('#0006');
  const b = parseColor('rgba(0 0 0 / .4)');
  assert.equal(a.a, b.a);
  assert.deepEqual([a.r, a.g, a.b], [b.r, b.g, b.b]);
});

test('parseColor formats', () => {
  assert.deepEqual(parseColor('#f00'), { r: 255, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor('#ff0000'), { r: 255, g: 0, b: 0, a: 1 });
  assert.equal(parseColor('#ff000080').a.toFixed(2), '0.50');
  assert.deepEqual(parseColor('rgb(255, 0, 0)'), { r: 255, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor('rgb(255 0 0)'), { r: 255, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor('rgba(255,0,0,.5)'), { r: 255, g: 0, b: 0, a: 0.5 });
  assert.deepEqual(parseColor('hsl(120 100% 50%)'), { r: 0, g: 255, b: 0, a: 1 });
  assert.deepEqual(parseColor('hsla(0, 100%, 50%, 0.25)'), { r: 255, g: 0, b: 0, a: 0.25 });
  assert.deepEqual(parseColor('transparent'), { r: 0, g: 0, b: 0, a: 0 });
  assert.equal(parseColor('var(--x)'), null);
  assert.equal(parseColor('color-mix(in srgb, red, blue)'), null);
  assert.equal(parseColor('#12'), null);
  assert.equal(parseColor('nonsense'), null);
});

test('semi-transparent fg composites over bg', () => {
  const a = contrast('rgba(0,0,0,.5)', '#fff');
  const b = contrast('#808080', '#fff');
  assert.ok(Math.abs(a - b) < 0.05, `${a} vs ${b}`);
});

test('semi-transparent bg composites over white (light) or black (dark)', () => {
  const light = contrast('#000', 'rgba(255,255,255,.5)');
  assert.equal(r2(light), r2(contrast('#000', '#fff')));
  const dark = contrast('#fff', 'rgba(255,255,255,.5)', { over: '#000' });
  assert.ok(Math.abs(dark - contrast('#fff', '#808080')) < 0.05);
});

test('unparseable colour gives null contrast', () => {
  assert.equal(contrast('var(--x)', '#fff'), null);
  assert.equal(contrast('#000', 'color-mix(in srgb, red, blue)'), null);
});

test('example project passes every required pair in all four modes', () => {
  const res = checkPairs(example, schema);
  assert.ok(res.length > 0);
  const bad = res.filter((r) => r.status !== 'pass');
  assert.deepEqual(bad, []);
  assert.deepEqual([...new Set(res.map((r) => r.mode))].sort(), ['dark', 'dark-hc', 'light', 'light-hc']);
});

test('schema: required roles are all listed roles', () => {
  for (const r of schema.required) assert.ok(schema.roles.includes(r), r);
  assert.ok(schema.roles.includes('bg.grouped.primary'));
  assert.ok(schema.required.includes('accent.on'));
});

test('var() slot is unresolvable, not a pass', () => {
  const p = clone(example);
  p.roles['label.primary'].light = 'var(--x)';
  const res = checkPairs(p, schema).filter((r) => r.fg === 'label.primary' && r.mode === 'light');
  assert.ok(res.length > 0);
  assert.ok(res.every((r) => r.status === 'unresolvable' && r.ratio === null));
});

test('failing pair is reported fail', () => {
  const p = clone(example);
  p.roles['label.secondary'].light = '#eeeeee';
  const res = checkPairs(p, schema).filter((r) => r.fg === 'label.secondary' && r.mode === 'light');
  assert.ok(res.every((r) => r.status === 'fail' && r.ratio < r.min));
});

test('dark-only project marks light slots missing', () => {
  const p = clone(example);
  p.modes = ['dark'];
  for (const r of Object.values(p.roles)) { delete r.light; delete r['light-hc']; }
  const res = checkPairs(p, schema);
  const light = res.filter((r) => r.mode === 'light' || r.mode === 'light-hc');
  assert.ok(light.length > 0);
  assert.ok(light.every((r) => r.status === 'missing'));
  assert.ok(res.filter((r) => r.mode === 'dark').every((r) => r.status === 'pass'));
});

test('hc slot falls back to the normal slot', () => {
  const p = clone(example);
  for (const r of Object.values(p.roles)) { delete r['light-hc']; delete r['dark-hc']; }
  const res = checkPairs(p, schema);
  const hc = res.filter((r) => r.mode === 'light-hc');
  assert.ok(hc.length > 0);
  assert.ok(hc.every((r) => r.status === 'pass'));
  const same = (m) => res.filter((r) => r.mode === m).map((r) => r.ratio);
  assert.deepEqual(same('light-hc'), same('light'));
});

test('hc fallback that fails is reported fail', () => {
  const p = clone(example);
  p.roles['label.tertiary'].light = '#f0f0f0';
  delete p.roles['label.tertiary']['light-hc'];
  const res = checkPairs(p, schema).filter((r) => r.fg === 'label.tertiary' && r.mode === 'light-hc');
  assert.ok(res.every((r) => r.status === 'fail'));
});

test('missing role slot is reported missing', () => {
  const p = clone(example);
  delete p.roles['bg.secondary'];
  const res = checkPairs(p, schema).filter((r) => r.bg === 'bg.secondary');
  assert.ok(res.length > 0 && res.every((r) => r.status === 'missing'));
});

test('project pairs are appended and .* globs expand', () => {
  const p = clone(example);
  p.roles['grade.v0'] = { light: '#007a33', dark: '#4ade80' };
  p.roles['grade.v3'] = { light: '#1d4ed8', dark: '#93c5fd' };
  p.pairs = [{ fg: 'grade.*', bg: 'bg.primary', min: 3 }];
  const res = checkPairs(p, schema).filter((r) => r.fg.startsWith('grade.') && r.mode === 'light');
  assert.deepEqual(res.map((r) => r.fg).sort(), ['grade.v0', 'grade.v3']);
});

test('bg.* glob matches bg.grouped.* too', () => {
  const res = checkPairs(example, schema).filter((r) => r.fg === 'label.primary' && r.mode === 'light');
  assert.deepEqual(res.map((r) => r.bg).sort(), [
    'bg.grouped.primary', 'bg.grouped.secondary', 'bg.grouped.tertiary',
    'bg.primary', 'bg.secondary', 'bg.tertiary',
  ]);
});

test('translucent bg is composited over white in light, black in dark', () => {
  const p = clone(example);
  p.roles['bg.primary'].light = 'rgba(255,255,255,.5)';
  p.roles['bg.primary'].dark = 'rgba(0,0,0,.5)';
  const res = checkPairs(p, schema).filter((r) => r.fg === 'label.primary' && r.bg === 'bg.primary');
  assert.ok(res.every((r) => r.status === 'pass'));
});

test('emitColorCss includes prefers-color-scheme and prefers-contrast blocks', () => {
  const css = emitColorCss(example, schema);
  assert.match(css, /^:root\{/);
  assert.ok(css.includes('@media (prefers-color-scheme: dark){:root{'));
  assert.ok(css.includes('@media (prefers-contrast: more){:root{'));
  assert.ok(css.includes('@media (prefers-color-scheme: dark) and (prefers-contrast: more){:root{'));
  assert.ok(css.includes('[data-theme="light"]{'));
  assert.ok(css.includes('[data-theme="dark"]{'));
  assert.ok(css.includes('--df-color-bg-grouped-primary:'));
  const order = [':root{', '(prefers-color-scheme: dark){', '(prefers-contrast: more){', 'dark) and (prefers-contrast', '[data-theme="light"]', '[data-theme="dark"]'].map((s) => css.indexOf(s));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test('emitColorCss omits absent slots', () => {
  const p = { roles: { 'bg.primary': { light: '#fff' }, 'label.primary': { light: '#000', dark: '#fff' } } };
  const css = emitColorCss(p, schema);
  assert.ok(!css.includes('prefers-contrast'));
  assert.ok(css.includes('--df-color-label-primary:#fff'));
  const dark = css.match(/prefers-color-scheme: dark\)\{:root\{([^}]*)\}/)[1];
  assert.ok(!dark.includes('bg-primary'));
});
