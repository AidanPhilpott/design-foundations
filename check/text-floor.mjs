// text-floor: font sizes below the 11px floor, literal or resolved from a --df-type-*-size token.
import { registerCheck } from './registry.mjs';
import { fileDecls, classTokens, isCustomProp, declSnippet } from './decls.mjs';

export const TEXT_FLOOR_RULE_IDS = ['TYP-01', 'ACC-02'];

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const UNIT_PX = { px: 1, rem: 16, em: 16, pt: 4 / 3 };

/** {`--df-type-<style>-size`: px} for every typography token. */
function typeSizes(tokens) {
  const sizes = new Map();
  for (const [path, tok] of tokens) {
    if (tok.type === 'typography' && path.startsWith('type.')) sizes.set(`--df-type-${kebab(path.slice(5))}-size`, Number(tok.value.size));
  }
  return sizes;
}

const toPx = (num, unit) => (UNIT_PX[unit] ? parseFloat(num) * UNIT_PX[unit] : null);

/** Pixel size a font-size / font declaration resolves to, or null when it is not a plain literal or known token. */
export function resolveSize(prop, value, sizes) {
  const v = value.trim();
  const fn = v.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/);
  if (prop === 'font-size') {
    if (fn) return sizes.get(fn[1]) ?? null;
    const m = v.match(/^(-?\d*\.?\d+)(px|rem|em|pt)$/);
    return m ? toPx(m[1], m[2]) : null;
  }
  if (prop === 'font') {
    const m = v.match(/(?<![\w.#-])(\d*\.?\d+)(px|rem|em|pt)(?=\/|\s|$)/);
    return m ? toPx(m[1], m[2]) : null;
  }
  return null;
}

const fmt = (n) => `${Math.round(n * 100) / 100}px`;

registerCheck({
  id: 'text-floor',
  ruleIds: TEXT_FLOOR_RULE_IDS,
  run(ctx) {
    const sizes = typeSizes(ctx.tokens);
    const floor = Number(ctx.tokens.get('type.floor.min')?.value ?? 11);
    const out = [];
    for (const file of ctx.files) {
      for (const d of fileDecls(file)) {
        if (isCustomProp(d.prop)) continue;
        const px = resolveSize(d.prop, d.value, sizes);
        if (px !== null && px > 0 && px < floor) {
          out.push({ file: file.path, line: d.line, snippet: declSnippet(d), message: `font size ${fmt(px)} is below the ${floor}px floor` });
        }
      }
      for (const c of classTokens(file)) {
        const m = c.value.match(/(?:^|:)text-\[(?:length:)?(-?\d*\.?\d+)(px|rem|em|pt)\]$/);
        const px = m ? toPx(m[1], m[2]) : null;
        if (px !== null && px > 0 && px < floor) {
          out.push({ file: file.path, line: c.line, snippet: c.value, message: `font size ${fmt(px)} is below the ${floor}px floor` });
        }
      }
    }
    return out;
  },
});
