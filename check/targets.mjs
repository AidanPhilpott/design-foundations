// targets (static): interactive selectors with an explicit width/height below the 44px target size.
import { registerCheck } from './registry.mjs';
import { fileDecls, isCustomProp } from './decls.mjs';

export const TARGETS_RULE_IDS = ['ACC-04'];
const MIN = 44;

const INTERACTIVE = /^(?:button|a|input|summary|select)(?![\w-])|\[\s*role\s*=\s*["']?button["']?\s*\]/i;
const splitList = (sel) => sel.split(/,(?![^(]*\))/).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
/** The compound selector that styles the element: text after the last combinator. */
const lastCompound = (part) => part.replace(/\s*[>+~]\s*/g, ' ').split(' ').at(-1);

function toPx(value) {
  const m = value.replace(/\s*!important\s*$/i, '').trim().match(/^(-?\d*\.?\d+)(px|rem)$/i);
  return m ? parseFloat(m[1]) * (m[2].toLowerCase() === 'rem' ? 16 : 1) : null;
}
const DIMS = { width: 'min-width', height: 'min-height' };
const BLOCKISH = /^(?:inline-block|block|flex|inline-flex|grid|inline-grid)$/i;

/** Interactive kind of one selector part: 'link', 'other', or null when not interactive. */
function kindOf(part, extra) {
  const c = lastCompound(part);
  if (/^a(?![\w-])/i.test(c)) return 'link';
  if (INTERACTIVE.test(c)) return 'other';
  if (extra.some((s) => c.includes(s))) return 'other';
  return null;
}

registerCheck({
  id: 'targets',
  ruleIds: TARGETS_RULE_IDS,
  run(ctx) {
    const extra = (ctx.config.targetSelectors ?? []).map((s) => s.trim()).filter(Boolean);
    const out = [];
    for (const file of ctx.files) {
      // Group consecutive declarations of one rule (same selector and at-rule context).
      const groups = [];
      for (const d of fileDecls(file)) {
        if (isCustomProp(d.prop) || !d.selector) continue;
        const key = `${d.selector}\0${(d.atRules ?? []).join('|')}`;
        const g = groups.at(-1);
        if (g && g.key === key) g.decls.push(d);
        else groups.push({ key, selector: d.selector, decls: [d] });
      }
      for (const g of groups) {
        const px = (prop) => {
          const vals = g.decls.filter((d) => d.prop === prop).map((d) => toPx(d.value)).filter((v) => v !== null);
          return vals.length ? vals : null;
        };
        const display = g.decls.filter((d) => d.prop === 'display').map((d) => d.value.replace(/\s*!important\s*$/i, '').trim()).at(-1);
        const small = [];
        for (const [dim, minDim] of Object.entries(DIMS)) {
          if ((px(minDim) ?? []).some((v) => v >= MIN)) continue;
          for (const prop of [dim, minDim]) for (const d of g.decls) if (d.prop === prop) {
            const v = toPx(d.value);
            if (v !== null && v < MIN) small.push({ d, prop });
          }
        }
        if (!small.length) continue;
        for (const part of splitList(g.selector)) {
          const kind = kindOf(part, extra);
          if (!kind) continue;
          // Inline links are out of scope unless made block-ish; width/height on them is explicit sizing.
          const offending = kind === 'link' && !(display && BLOCKISH.test(display)) ? small.filter((s) => s.prop === 'width' || s.prop === 'height') : small;
          if (!offending.length) continue;
          const body = offending.map(({ d }) => `${d.prop}: ${d.value}`).join('; ');
          out.push({
            file: file.path,
            line: offending[0].d.line,
            snippet: `${part} { ${body} }`,
            message: `${part} sets ${body}, below the ${MIN}px minimum target size; add min-width/min-height of ${MIN}px`,
            ruleIds: ['ACC-04'],
          });
        }
      }
    }
    return out;
  },
});
