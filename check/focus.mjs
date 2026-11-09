// focus: `outline: none|0` on a selector that has no :focus-visible replacement rule for the same element.
import { registerCheck } from './registry.mjs';
import { fileDecls, isCustomProp, declSnippet } from './decls.mjs';

export const FOCUS_RULE_IDS = ['ACC-05'];

const squash = (s) => s.replace(/\s+/g, ' ').trim();

/** Does this declaration remove the outline? */
function removesOutline(prop, value) {
  const toks = value.toLowerCase().split(/\s+/).filter(Boolean);
  if (prop === 'outline') return toks.length > 0 && toks.every((t) => t === 'none' || t === '0' || t === '0px');
  if (prop === 'outline-style') return value.trim().toLowerCase() === 'none';
  if (prop === 'outline-width') return /^0(?:px)?$/.test(value.trim());
  return false;
}

/** Selector parts with :not(:focus-visible) removed. */
const parts = (selector) => selector.replace(/:not\(\s*:focus-visible\s*\)/g, '').split(/,(?![^(]*\))/).map(squash).filter(Boolean);
const hasFv = (part) => /:focus-visible/.test(part);
/** The element a selector part styles: focus pseudo-classes stripped, whitespace collapsed. '' = any element. */
const base = (part) => squash(part.replace(/:focus-visible|:focus-within|:focus(?![\w-])/g, '')).replace(/^\*$/, '');

registerCheck({
  id: 'focus',
  ruleIds: FOCUS_RULE_IDS,
  run(ctx) {
    const all = [];
    for (const file of ctx.files) for (const d of fileDecls(file)) if (!isCustomProp(d.prop) && d.selector) all.push({ file: file.path, d });

    // Bases that have a :focus-visible rule setting something other than outline removal.
    const replaced = new Set();
    for (const { d } of all) {
      if (removesOutline(d.prop, d.value)) continue;
      for (const p of parts(d.selector)) if (hasFv(p)) replaced.add(base(p));
    }

    const out = [];
    for (const { file, d } of all) {
      if (!removesOutline(d.prop, d.value)) continue;
      const bases = parts(d.selector).map(base);
      const missing = bases.filter((b) => !replaced.has(b) && !replaced.has(''));
      if (missing.length) {
        out.push({ file, line: d.line, snippet: declSnippet(d), message: `outline removed on ${missing.map((b) => b || '*').join(', ')} with no :focus-visible replacement rule` });
      }
    }
    return out;
  },
});
