import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadTokens, resolveTokens, TokenError } from '../build/tokens.mjs';

const dir = new URL('../tokens/base/', import.meta.url).pathname;
const base = () => resolveTokens(loadTokens(readdirSync(dir).sort().map((f) => join(dir, f))));
const tmp = (name, obj) => {
  const p = join(mkdtempSync(join(tmpdir(), 'df-')), name);
  writeFileSync(p, JSON.stringify(obj));
  return p;
};
const v = (t, k) => t.get(k).value;

test('base tokens resolve with spec values', () => {
  const t = base();
  const durs = { instant: '0ms', micro: '100ms', short: '200ms', medium: '300ms', long: '500ms' };
  for (const [k, x] of Object.entries(durs)) assert.equal(v(t, `motion.duration.${k}`), x);
  assert.equal(t.get('motion.duration.micro').type, 'duration');
  assert.equal(v(t, 'motion.camera.near'), '500ms');
  assert.equal(v(t, 'motion.camera.far'), '800ms');
  assert.deepEqual(v(t, 'motion.ease.standard'), [0.4, 0, 0.2, 1]);
  assert.deepEqual(v(t, 'motion.ease.enter'), [0, 0, 0.2, 1]);
  assert.deepEqual(v(t, 'motion.ease.exit'), [0.4, 0, 1, 1]);
  assert.equal(t.get('motion.ease.exit').type, 'cubicBezier');
  assert.deepEqual(t.get('motion.spring.smooth').ext, { duration: 0.5, bounce: 0 });
  assert.deepEqual(t.get('motion.spring.snappy').ext, { duration: 0.5, bounce: 0.15 });
  assert.deepEqual(t.get('motion.spring.bouncy').ext, { duration: 0.5, bounce: 0.3 });
  assert.equal(t.get('motion.spring.smooth').type, 'spring');
});

test('typography: 11 styles, family, floors', () => {
  const t = base();
  const want = {
    largeTitle: [34, 41, 400, 700], title1: [28, 34, 400, 700], title2: [22, 28, 400, 700],
    title3: [20, 25, 400, 600], headline: [17, 22, 600, 600], body: [17, 22, 400, 600],
    callout: [16, 21, 400, 600], subhead: [15, 20, 400, 600], footnote: [13, 18, 400, 600],
    caption1: [12, 16, 400, 600], caption2: [11, 13, 400, 600],
  };
  for (const [s, [size, leading, weight, weightEmphasized]] of Object.entries(want)) {
    assert.deepEqual(v(t, `type.${s}`), { size, leading, weight, weightEmphasized }, s);
    assert.equal(t.get(`type.${s}`).type, 'typography');
  }
  assert.equal([...t.keys()].filter((k) => /^type\.(?!fontFamily|floor)/.test(k)).length, 11);
  assert.deepEqual(v(t, 'type.fontFamily.default'), ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']);
  assert.equal(v(t, 'type.floor.body'), 17);
  assert.equal(v(t, 'type.floor.min'), 11);
});

test('space, layout, a11y, radius, materials', () => {
  const t = base();
  const keys = ['0', '0_5', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];
  const px = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  keys.forEach((k, i) => assert.equal(v(t, `space.${k}`), px[i], k));
  assert.equal(v(t, 'layout.margin.compact'), 16);
  assert.equal(v(t, 'layout.margin.regular'), 20);
  assert.equal(v(t, 'layout.breakpoint.regular'), '700px');
  assert.equal(v(t, 'a11y.target.default'), 44);
  assert.equal(v(t, 'a11y.target.min'), 28);
  assert.equal(v(t, 'a11y.spacing.bezel'), 12);
  assert.equal(v(t, 'a11y.spacing.bare'), 24);
  const r = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: '9999px' };
  for (const [k, x] of Object.entries(r)) assert.equal(v(t, `radius.${k}`), x);
  const m = { ultraThin: [10, 0.55], thin: [20, 0.65], regular: [30, 0.75], thick: [40, 0.85] };
  for (const [k, [b, o]] of Object.entries(m)) {
    assert.equal(v(t, `material.${k}.blur`), `${b}px`);
    assert.equal(v(t, `material.${k}.opacity`), o);
  }
});

test('transitions per spec 4.1, aliases resolved', () => {
  const t = base();
  const smooth = { duration: 0.5, bounce: 0 };
  const std = [0.4, 0, 0.2, 1];
  for (const k of ['push', 'pop']) {
    assert.deepEqual(v(t, `motion.transition.${k}`), {
      normal: { properties: ['transform', 'opacity'], duration: '300ms', easing: smooth, distance: '28px' },
      reduced: { properties: ['opacity'], duration: '200ms', easing: std },
    });
  }
  assert.deepEqual(v(t, 'motion.transition.rise'), {
    normal: { properties: ['transform', 'opacity'], duration: '300ms', easing: [0, 0, 0.2, 1], distance: '16px' },
    reduced: { properties: ['opacity'], duration: '200ms', easing: std },
  });
  assert.deepEqual(v(t, 'motion.transition.sheet'), {
    normal: { properties: ['transform'], duration: '500ms', easing: smooth },
    reduced: { properties: ['transform'], duration: '200ms', easing: std },
  });
  const fb = v(t, 'motion.transition.feedback');
  assert.deepEqual(fb.normal.properties, ['background-color', 'color', 'transform']);
  assert.equal(fb.normal.duration, '100ms');
  assert.deepEqual(fb.reduced.properties, ['background-color', 'color']);
  assert.equal(fb.reduced.duration, '100ms');
  const cam = v(t, 'motion.transition.camera');
  assert.deepEqual(cam.normal.properties, ['camera']);
  assert.equal(cam.normal.duration, '500ms');
  assert.equal(cam.reduced.duration, '0ms');
  const loop = v(t, 'motion.transition.loop');
  assert.deepEqual(loop.normal.properties, ['opacity']);
  assert.equal(loop.normal.duration, '500ms');
  assert.deepEqual(loop.reduced.properties, []);
  assert.equal(loop.reduced.duration, '0ms');
  assert.equal(t.get('motion.transition.push').type, 'transition');
});

test('top-level alias takes the target value; group $type is inherited', () => {
  const p = tmp('a.json', { g: { $type: 'dimension', a: { $value: 4 }, b: { $value: '{g.a}' } } });
  const t = resolveTokens(loadTokens([p]));
  assert.equal(t.get('g.b').value, 4);
  assert.equal(t.get('g.b').type, 'dimension');
});

test('unresolved alias throws with path', () => {
  const p = tmp('a.json', { x: { y: { $type: 'duration', $value: '{nope.missing}' } } });
  assert.throws(() => resolveTokens(loadTokens([p])), (e) => e instanceof TokenError && e.message.includes('x.y') && e.message.includes('nope.missing'));
  const q = tmp('b.json', { x: { $type: 'transition', $value: { normal: { duration: '{nope.nested}' } } } });
  assert.throws(() => resolveTokens(loadTokens([q])), (e) => e instanceof TokenError && e.message.includes('nope.nested'));
});

test('alias cycle throws', () => {
  const p = tmp('a.json', { a: { $value: '{b}' }, b: { $value: '{c}' }, c: { $value: '{a}' } });
  assert.throws(() => resolveTokens(loadTokens([p])), (e) => e instanceof TokenError && /cycle/.test(e.message) && e.message.includes('a'));
});

test('later file overrides earlier', () => {
  const p1 = tmp('1.json', { m: { $type: 'dimension', a: { $value: 1 }, b: { $value: 2 } } });
  const p2 = tmp('2.json', { m: { a: { $value: 9 }, c: { $value: 3 } } });
  const t = resolveTokens(loadTokens([p1, p2]));
  assert.equal(t.get('m.a').value, 9);
  assert.equal(t.get('m.b').value, 2);
  assert.equal(t.get('m.c').value, 3);
});
