import { test, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from '../build/build.mjs';

let m;
let outDir;
before(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'df-motion-'));
  await build({ out: outDir });
  writeFileSync(join(outDir, 'package.json'), '{"type":"module"}');
  m = await import(pathToFileURL(join(outDir, 'motion.js')).href);
});

/** Controllable matchMedia stub. */
function stubMedia(initial) {
  const state = { matches: initial, listeners: new Set() };
  const mql = {
    get matches() { return state.matches; },
    addEventListener: (_t, cb) => state.listeners.add(cb),
    removeEventListener: (_t, cb) => state.listeners.delete(cb),
  };
  globalThis.matchMedia = (q) => {
    assert.match(q, /prefers-reduced-motion: reduce/);
    return mql;
  };
  state.set = (v) => {
    state.matches = v;
    for (const cb of [...state.listeners]) cb({ matches: v });
  };
  return state;
}
afterEach(() => { delete globalThis.matchMedia; });

const mockMap = () => {
  const calls = [];
  const rec = (n) => (...a) => calls.push([n, ...a]);
  return { calls, flyTo: rec('flyTo'), setView: rec('setView'), flyToBounds: rec('flyToBounds'), fitBounds: rec('fitBounds') };
};

test('prefersReducedMotion is false when matchMedia is missing', () => {
  assert.equal(m.prefersReducedMotion(), false);
  assert.equal(m.duration('cameraFar'), 800);
  const off = m.onReducedMotionChange(() => {});
  assert.equal(typeof off, 'function');
  off();
});

test('camera uses flyTo normally and setView when reduced', () => {
  const media = stubMedia(false);
  const map = mockMap();
  m.camera(map, [49.7, -123.1], { zoom: 15 });
  m.camera(map, [49.7, -123.1], { zoom: 12, far: true });
  assert.deepEqual(map.calls[0], ['flyTo', [49.7, -123.1], 15, { duration: 0.5 }]);
  assert.deepEqual(map.calls[1], ['flyTo', [49.7, -123.1], 12, { duration: 0.8 }]);
  media.set(true);
  m.camera(map, [49.7, -123.1], { zoom: 15 });
  assert.deepEqual(map.calls[2], ['setView', [49.7, -123.1], 15, { animate: false }]);
  assert.equal(m.duration('cameraNear'), 0);
  assert.equal(m.duration('cameraFar'), 0);
  assert.equal(m.duration('medium'), 300);
});

test('camera with bounds uses flyToBounds / fitBounds', () => {
  const media = stubMedia(false);
  const map = mockMap();
  const bounds = { getNorthEast() {} };
  m.camera(map, bounds, { padding: [8, 8] });
  assert.deepEqual(map.calls[0], ['flyToBounds', bounds, { padding: [8, 8], duration: 0.5 }]);
  media.set(true);
  m.camera(map, bounds, { padding: [8, 8] });
  assert.deepEqual(map.calls[1], ['fitBounds', bounds, { padding: [8, 8], animate: false }]);
});

test('toggling reduced motion at runtime changes transition(push) without reload', () => {
  const media = stubMedia(false);
  const seen = [];
  const off = m.onReducedMotionChange((v) => seen.push(v));
  const normal = m.transition('push');
  assert.equal(normal.duration, 300);
  assert.deepEqual(normal.properties, ['transform', 'opacity']);
  assert.match(normal.easing, /^linear\(/);
  media.set(true);
  const reduced = m.transition('push');
  assert.equal(reduced.duration, 200);
  assert.deepEqual(reduced.properties, ['opacity']);
  assert.equal(reduced.easing, 'cubic-bezier(0.4, 0, 0.2, 1)');
  assert.deepEqual(seen, [true]);
  off();
  media.set(false);
  assert.deepEqual(seen, [true]);
  assert.equal(m.transition('push').duration, 300);
});

test('onReducedMotionChange falls back to addListener', () => {
  const ls = new Set();
  globalThis.matchMedia = () => ({ matches: false, addListener: (cb) => ls.add(cb), removeListener: (cb) => ls.delete(cb) });
  const off = m.onReducedMotionChange(() => {});
  assert.equal(ls.size, 1);
  off();
  assert.equal(ls.size, 0);
});

const mockEl = () => {
  const anims = [];
  return {
    anims,
    style: {},
    animate(keyframes, opts) {
      const a = { keyframes, opts, cancelled: false, cancel() { this.cancelled = true; } };
      anims.push(a);
      return a;
    },
  };
};

test('animate cancels the previous animation on the same element', () => {
  stubMedia(false);
  const el = mockEl();
  const a1 = m.animate(el, 'push');
  assert.equal(a1.opts.duration, 300);
  assert.equal(a1.opts.fill, 'both');
  assert.match(a1.opts.easing, /^linear\(/);
  assert.equal(a1.cancelled, false);
  const a2 = m.animate(el, 'pop');
  assert.equal(a1.cancelled, true);
  assert.equal(a2.cancelled, false);
  assert.equal(a2.keyframes[0].transform, 'translateX(-28px)');
});

test('animate under reduced motion keeps only reduced properties; loop returns null with end state', () => {
  const media = stubMedia(true);
  const el = mockEl();
  const a = m.animate(el, 'push');
  assert.equal(a.opts.duration, 200);
  assert.ok(a.keyframes.every((k) => !('transform' in k)));
  assert.equal(m.animate(el, 'loop'), null); // no keyframes: nothing to do
  const el2 = mockEl();
  const frames = [{ opacity: 0.4 }, { opacity: 1 }];
  assert.equal(m.animate(el2, 'loop', frames), null);
  assert.equal(el2.style.opacity, 1);
  assert.equal(el2.anims.length, 0);
  media.set(false);
  assert.equal(m.animate(mockEl(), 'sheet'), null); // needs explicit keyframes
});

test('dist/motion.js has no import statements', () => {
  const src = readFileSync(join(outDir, 'motion.js'), 'utf8');
  assert.doesNotMatch(src, /^\s*import\s/m);
  assert.doesNotMatch(src, /\bimport\s*\(/);
  assert.doesNotMatch(src, /\brequire\s*\(/);
  assert.doesNotMatch(src, /__DF_TOKENS__/);
  assert.match(src, /"cameraFar":\s*800/);
});

test('dist/motion.global.js is a classic script exposing the same API as DFMotion', async () => {
  const vm = await import('node:vm');
  const src = readFileSync(join(outDir, 'motion.global.js'), 'utf8');
  assert.doesNotMatch(src, /^\s*(?:import|export)\s/m);
  assert.doesNotMatch(src, /__DF_TOKENS__/);
  stubMedia(true);
  const ctx = { matchMedia: globalThis.matchMedia };
  ctx.globalThis = ctx;
  vm.runInNewContext(src, ctx); // classic script: no module syntax allowed
  assert.deepEqual(Object.keys(ctx.DFMotion).sort(), Object.keys(m).sort());
  assert.equal(ctx.DFMotion.prefersReducedMotion(), true);
  assert.equal(ctx.DFMotion.duration('camera' + 'Far'), 0);
  assert.equal(ctx.DFMotion.duration('short'), m.duration('short'));
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.DFMotion.transition('push'))), m.transition('push'));
});
