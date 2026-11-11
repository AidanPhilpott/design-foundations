// grid: spacing, sizes and radii that are off the 4-point grid (LAY-07).
// Checked properties: padding*, margin*, gap family, inset*, top/right/bottom/left, width/height (+min/max, inline/block-size),
// flex-basis and border radii, plus the matching Tailwind arbitrary values (`p-[6px]`, `w-[18px]`, `rounded-[10px]`).
// Allowed: multiples of 4, the 2px half step and 0. rem converts at 16px. Not checked: %, viewport units, em, keywords,
// radii of 999px or more (full round), borders, outlines, line-heights, transforms, custom properties.
import { registerCheck } from './registry.mjs';
import { fileDecls, classTokens, isCustomProp, declSnippet, GRID_PROP } from './decls.mjs';

export const GRID_RULE_IDS = ['LAY-07'];

const EPS = 1e-6;
const onGrid = (px) => {
  const a = Math.abs(px);
  return a < EPS || Math.abs(a - 2) < EPS || Math.abs(a / 4 - Math.round(a / 4)) < EPS;
};
const LITERAL = /(?<![\w.#])-?(\d*\.?\d+)(px|rem)(?![\w%])/g;
const RADIUS = /radius$/;

/** Blank var()/env()/url()/attr() but keep a var() fallback, so `var(--x, 10px)` is still read. */
function literalsOnly(value) {
  let out = value;
  for (let prev = null; prev !== out; ) {
    prev = out;
    out = out.replace(/\bvar\(\s*--[\w-]+\s*,([^()]*)\)/gi, ' $1 ').replace(/\bvar\(\s*--[\w-]+\s*\)/gi, ' ').replace(/\b(?:url|env|attr)\([^()]*\)/gi, ' ');
  }
  return out;
}

const fmt = (n) => `${Math.round(n * 100) / 100}`;

/** Off-grid px literals (as written, e.g. "6px", "0.375rem") in a value, in order. `radius` lets full-round values through. */
function offGrid(value, radius) {
  const out = [];
  for (const m of literalsOnly(value).matchAll(LITERAL)) {
    const px = parseFloat(m[1]) * (m[2] === 'rem' ? 16 : 1);
    if (radius && px >= 999) continue;
    if (!onGrid(px)) out.push({ text: m[0].replace(/^-/, ''), px });
  }
  return out;
}

const near = (px) => {
  const lo = Math.floor(px / 4) * 4;
  return px < 2 ? '0, 2 or a border' : `${lo} or ${lo + 4}`;
};
const describe = (bad) => bad.map((b) => (b.text.endsWith('rem') ? `${b.text} (${fmt(b.px)}px)` : b.text)).join(', ');
const advice = (bad) => (bad.some((b) => b.px < 2) ? 'use 0, 2 or a border' : `use ${[...new Set(bad.map((b) => near(b.px)))].join('; ')} or a var(--df-space-*) token`);

/** Off-grid literals of a declaration (empty = fine). */
export function gridReasons(prop, value) {
  if (!GRID_PROP.test(prop)) return [];
  return offGrid(value, RADIUS.test(prop)).map((b) => b.text);
}

const SPACING = '(?:p[xytrblse]?|m[xytrblse]?|scroll-[mp][xytrblse]?|space-[xy]|gap(?:-[xy])?|inset(?:-[xy])?|top|right|bottom|left|start|end|w|h|size|min-w|min-h|max-w|max-h|basis|rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?)';
const ARBITRARY = new RegExp(`^(?:[^\\[\\]]|\\[[^\\]]*\\])*?-?(?<util>${SPACING})-\\[(?<arg>[^\\]]+)\\]$`);

/** Reason a Tailwind class token holds an off-grid arbitrary value, or null. */
export function gridClassReason(token) {
  const m = token.match(ARBITRARY);
  if (!m) return null;
  const bad = offGrid(m.groups.arg.replace(/_/g, ' '), m.groups.util.startsWith('rounded'));
  return bad.length ? `${describe(bad)} is off the 4-point grid; ${advice(bad)}` : null;
}

registerCheck({
  id: 'grid',
  ruleIds: GRID_RULE_IDS,
  run(ctx) {
    const out = [];
    for (const file of ctx.files) {
      for (const d of fileDecls(file)) {
        if (isCustomProp(d.prop) || !GRID_PROP.test(d.prop)) continue;
        const bad = offGrid(d.value, RADIUS.test(d.prop));
        if (bad.length) out.push({ file: file.path, line: d.line, snippet: declSnippet(d), ruleIds: GRID_RULE_IDS, message: `${describe(bad)} is off the 4-point grid; ${advice(bad)}` });
      }
      for (const c of classTokens(file)) {
        const reason = gridClassReason(c.value);
        if (reason) out.push({ file: file.path, line: c.line, snippet: c.value, ruleIds: GRID_RULE_IDS, message: `Tailwind arbitrary value: ${reason}` });
      }
    }
    return out;
  },
});
