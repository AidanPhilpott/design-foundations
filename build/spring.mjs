// Damped-spring sampler: SwiftUI parametrisation (response = duration, damping ratio = 1 - bounce)
// turned into a CSS linear() easing plus the time it takes to settle within 0.1 %.

const TOLERANCE = 0.001;

export function springAt(t, { duration, bounce }) {
  if (t <= 0) return 0;
  const w0 = (2 * Math.PI) / duration;
  const zeta = 1 - bounce;
  if (zeta >= 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  const k = zeta * w0;
  return 1 - Math.exp(-k * t) * (Math.cos(wd * t) + (k / wd) * Math.sin(wd * t));
}

// Smallest whole millisecond after which |1 - x| stays below tolerance (searched to 5 x duration).
function settleMs(params) {
  const limit = Math.ceil(params.duration * 5 * 1000);
  let settle = 0;
  for (let ms = 0; ms <= limit; ms++) {
    if (Math.abs(1 - springAt(ms / 1000, params)) >= TOLERANCE) settle = ms + 1;
  }
  return settle;
}

export function springCurve(params, { points = 40 } = {}) {
  const settle = settleMs(params);
  const values = [];
  for (let i = 0; i < points; i++) {
    const v = i === points - 1 ? 1 : springAt((settle * i) / (points - 1) / 1000, params);
    values.push(String(Math.round(v * 1e4) / 1e4));
  }
  return { easing: `linear(${values.join(', ')})`, settleMs: settle };
}
