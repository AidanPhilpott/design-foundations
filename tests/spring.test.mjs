import { test } from 'node:test';
import assert from 'node:assert/strict';
import { springAt, springCurve } from '../build/spring.mjs';

test('bounce 0 never exceeds 1', () => {
  for (let ms = 0; ms <= 3000; ms += 5) {
    assert.ok(springAt(ms / 1000, { duration: 0.5, bounce: 0 }) <= 1 + 1e-9);
  }
});

test('bounce .3 overshoots then ends at 1', () => {
  const p = { duration: 0.5, bounce: 0.3 };
  let max = 0;
  for (let ms = 0; ms <= 3000; ms += 5) max = Math.max(max, springAt(ms / 1000, p));
  assert.ok(max > 1.001);
  assert.ok(Math.abs(springAt(5, p) - 1) < 0.001);
  assert.equal(springAt(0, p), 0);
});

test('easing starts "linear(0," and ends ", 1)"', () => {
  const { easing } = springCurve({ duration: 0.5, bounce: 0.3 });
  assert.ok(easing.startsWith('linear(0,'));
  assert.ok(easing.endsWith(', 1)'));
});

test('settleMs grows with duration', () => {
  const s = (d) => springCurve({ duration: d, bounce: 0.2 }).settleMs;
  assert.ok(s(0.3) < s(0.5));
  assert.ok(s(0.5) < s(0.8));
  assert.ok(Number.isInteger(s(0.3)));
});

test('point count == 40 by default', () => {
  const { easing } = springCurve({ duration: 0.5, bounce: 0.3 });
  assert.equal(easing.slice(7, -1).split(', ').length, 40);
  const c = springCurve({ duration: 0.5, bounce: 0 }, { points: 10 });
  assert.equal(c.easing.slice(7, -1).split(', ').length, 10);
});
