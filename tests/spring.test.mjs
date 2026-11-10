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

const close = (a, b, dp) => assert.ok(Math.abs(a - b) < 0.5 * 10 ** -dp, `${a} vs ${b}`);

test('critically damped value at t = duration', () => {
  close(springAt(0.5, { duration: 0.5, bounce: 0 }), 0.98640, 4);
});

test('underdamped known value and peak', () => {
  const p = { duration: 0.5, bounce: 0.3 };
  close(springAt(0.2, p), 0.8737, 4);
  let max = 0;
  for (let us = 0; us <= 1000000; us += 100) max = Math.max(max, springAt(us / 1e6, p));
  close(max, 1.0460, 3);
});

test('settle: within 0.1 % from settleMs to 5x duration, not at settleMs - 1', () => {
  for (const p of [{ duration: 0.5, bounce: 0.3 }, { duration: 0.3, bounce: 0 }, { duration: 0.8, bounce: 0.5 }]) {
    const { settleMs } = springCurve(p);
    for (let ms = settleMs; ms <= p.duration * 5000; ms++) {
      assert.ok(Math.abs(1 - springAt(ms / 1000, p)) < 0.001, `${ms}ms`);
    }
    assert.ok(Math.abs(1 - springAt((settleMs - 1) / 1000, p)) >= 0.001);
  }
});

test('curve values equal springAt at evenly spaced times; last is exactly 1', () => {
  for (const p of [{ duration: 0.5, bounce: 0.3 }, { duration: 0.5, bounce: 0 }]) {
    const { easing, settleMs } = springCurve(p);
    const vals = easing.slice(7, -1).split(', ').map(Number);
    vals.slice(0, -1).forEach((v, i) => {
      const expected = Math.round(springAt((settleMs * i) / 39 / 1000, p) * 1e4) / 1e4;
      assert.equal(v, expected);
    });
    assert.equal(vals.at(-1), 1);
  }
});

test('bounce-0 curve is non-decreasing and its midpoint is past 0.5', () => {
  const vals = springCurve({ duration: 0.5, bounce: 0 }).easing.slice(7, -1).split(', ').map(Number);
  for (let i = 1; i < vals.length; i++) assert.ok(vals[i] >= vals[i - 1]);
  assert.ok(vals[20] > 0.5);
});
