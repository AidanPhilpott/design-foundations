// Resolved tokens -> tokens.css. Deterministic: paths are emitted in sorted order.
import { readFileSync } from 'node:fs';
import { springCurve } from './spring.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const kebab = (s) => s.replace(/_/g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
export const varName = (path) => `--df-${path.split('.').map(kebab).join('-')}`;

const num = (n) => String(Math.round(n * 1e4) / 1e4);
const rem = (pt, base = 16) => `${num(pt / base)}rem`;
// Dimension numbers are px; strings pass through.
const dim = (v) => (typeof v === 'number' ? `${num(v)}px` : String(v));
const bezier = (v) => `cubic-bezier(${v.map(num).join(', ')})`;
const family = (list) =>
  (Array.isArray(list) ? list : [list]).map((f) => (/[\s"]/.test(f) && !/^".*"$/.test(f) ? `"${f}"` : f)).join(', ');

const isSpringValue = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'bounce' in v && 'duration' in v;
const sameSpring = (a, b) => a.duration === b.duration && a.bounce === b.bounce;

/** A simple value (duration, number, colour, ...) as CSS text. */
function plain(type, value) {
  if (type === 'dimension') return dim(value);
  if (type === 'cubicBezier') return bezier(value);
  if (type === 'fontFamily') return family(value);
  return String(value);
}

const SOLID_SUFFIX = { blur: '0px', opacity: '1' };

export function emitCss(resolved, { header = true } = {}) {
  const paths = [...resolved.keys()].sort();
  const springs = new Map(); // path -> ext
  for (const p of paths) if (resolved.get(p).type === 'spring') springs.set(p, resolved.get(p).ext);
  const shortMs = resolved.get('motion.duration.short')?.value ?? '200ms';

  const springVar = (ext) => {
    for (const [p, e] of springs) if (sameSpring(e, ext)) return varName(p);
    throw new Error(`no spring token matches ${JSON.stringify(ext)}`);
  };
  const easing = (v) => {
    if (isSpringValue(v)) return `var(${springVar(v)})`;
    if (Array.isArray(v)) return bezier(v);
    return String(v);
  };
  const props = (list) => (list.length ? list.join(', ') : 'none');

  const root = []; // [name, value]
  const motion = []; // reduced-motion overrides
  const solid = []; // material solid overrides
  const dynType = []; // type sizes for html.df-dynamic-type

  for (const p of paths) {
    const { type, value, ext } = resolved.get(p);
    const name = varName(p);
    if (type === 'spring') {
      const { easing: curve, settleMs } = springCurve(ext);
      root.push([name, curve], [`${name}-duration`, `${settleMs}ms`]);
      const calm = springCurve({ duration: ext.duration, bounce: 0 });
      motion.push([name, calm.easing], [`${name}-duration`, String(shortMs)]);
    } else if (type === 'transition') {
      const { normal, reduced } = value;
      root.push(
        [`${name}-duration`, String(normal.duration)],
        [`${name}-easing`, easing(normal.easing)],
        [`${name}-properties`, props(normal.properties)],
      );
      if (normal.distance !== undefined) root.push([`${name}-distance`, dim(normal.distance)]);
      motion.push(
        [`${name}-duration`, String(reduced.duration)],
        [`${name}-easing`, easing(reduced.easing)],
        [`${name}-properties`, props(reduced.properties)],
      );
      if (normal.distance !== undefined) motion.push([`${name}-distance`, '0px']);
    } else if (type === 'typography') {
      root.push(
        [`${name}-size`, rem(value.size)],
        [`${name}-leading`, rem(value.leading)],
        [`${name}-weight`, String(value.weight)],
        [`${name}-weight-em`, String(value.weightEmphasized ?? value.weight)],
      );
      // Under .df-dynamic-type the root is -apple-system-body (17pt at default), so sizes are pt ÷ 17.
      dynType.push([`${name}-size`, rem(value.size, 17)], [`${name}-leading`, rem(value.leading, 17)]);
    } else if (type === 'typographyRole') {
      // Type roles: px -> rem at the 16px root; not scaled by html.df-dynamic-type (projects own their role sizes).
      const fam = `var(${varName('type.fontFamily.default')})`;
      root.push(
        [name, `${value.weight} ${rem(value.size)}/${rem(value.leading)} ${fam}`],
        [`${name}-size`, rem(value.size)],
        [`${name}-leading`, rem(value.leading)],
        [`${name}-weight`, String(value.weight)],
        [`${name}-tracking`, `${num(value.tracking ?? 0)}em`],
        [`${name}-transform`, value.transform ?? 'none'],
      );
    } else {
      root.push([name, plain(type, value)]);
      const last = p.split('.').at(-1);
      if (p.startsWith('material.') && last in SOLID_SUFFIX) solid.push([name, SOLID_SUFFIX[last]]);
    }
  }

  const decls = (list, indent) => list.map(([k, v]) => `${indent}${k}: ${v};`).join('\n');
  const rootBlock = (list, indent = '') => `${indent}:root {\n${decls(list, `${indent}  `)}\n${indent}}`;

  const out = [];
  if (header) out.push(`/* design-foundations ${pkg.version} — generated, do not edit */`);
  out.push(rootBlock(root));
  if (motion.length) out.push(`@media (prefers-reduced-motion: reduce) {\n${rootBlock(motion, '  ')}\n}`);
  if (solid.length) {
    out.push(`@media (prefers-reduced-transparency: reduce) {\n${rootBlock(solid, '  ')}\n}`);
    out.push(`@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {\n${rootBlock(solid, '  ')}\n}`);
  }
  out.push(`@supports (font: -apple-system-body) {\n  html.df-dynamic-type {\n    font: -apple-system-body;\n${decls(dynType, '    ')}\n  }\n}`);
  return out.join('\n\n') + '\n';
}
