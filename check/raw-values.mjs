// raw-values: literal durations, easings, colours and font sizes outside the token files.
import { registerCheck } from './registry.mjs';
import { fileDecls, classTokens, isCustomProp, declSnippet } from './decls.mjs';

export const RAW_VALUES_RULE_IDS = ['MOT-11', 'COL-02', 'TYP-03'];

const REASON_RULE = {
  'literal duration': 'MOT-11',
  'literal easing': 'MOT-11',
  'literal colour': 'COL-02',
  'named colour': 'COL-02',
  'literal font size': 'TYP-03',
};
/** Rule IDs for a finding's reasons, in RAW_VALUES_RULE_IDS order. */
export const reasonRuleIds = (reasons) => RAW_VALUES_RULE_IDS.filter((id) => reasons.some((r) => REASON_RULE[r] === id));

const NAMED_COLORS = new Set(
  ('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' '),
);
// Properties whose values are names or text, never colours.
const NO_COLOR_NAMES = /^(?:-webkit-)?(?:transition|animation)|^(?:content|font-family|font|src|will-change|counter-\w+|quotes|grid-area|grid-template-areas|grid-template|view-transition-name|anchor-name|mask|-webkit-mask|list-style)/;

const TIMED = /^(?:-webkit-)?(?:transition|animation)(?:-duration|-delay|-timing-function)?$/;
const DURATION = /(?<![\w.#-])-?\d*\.?\d+m?s(?![\w-])/g;
const EASING = /cubic-bezier\(|(?<![\w-])linear\(|(?<![\w-])(?:ease-in-out|ease-in|ease-out|ease|linear)(?![\w(-])/;
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i;
const COLOR_FN = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const SIZE_LITERAL = /(?<![\w.#-])-?\d*\.?\d+(?:px|rem|em|pt|pc|cm|mm|in|ex|ch|vw|vh|vmin|vmax|%)(?![\w-])/;
const SIZE_KEYWORD = /(?<![\w-])(?:xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large)(?![\w-])/;

/** Blank var(...) and url(...) so only literals remain. */
function literalsOnly(value) {
  let out = value;
  for (let prev = null; prev !== out; ) {
    prev = out;
    out = out.replace(/\b(?:var|url|env|attr)\([^()]*\)/gi, ' ');
  }
  return out;
}

const isZero = (s) => /^-?0*\.?0+(?:m?s)?$/.test(s);

/** Reasons a declaration holds a raw value (empty = fine). */
export function rawReasons(prop, value) {
  const v = literalsOnly(value);
  if (/^(?:inherit|initial|unset|revert|none)$/i.test(v.trim())) return [];
  const reasons = [];
  if (TIMED.test(prop)) {
    if ([...v.matchAll(DURATION)].some((m) => !isZero(m[0]))) reasons.push('literal duration');
    if (EASING.test(v)) reasons.push('literal easing');
  }
  if (HEX.test(v) || COLOR_FN.test(v)) reasons.push('literal colour');
  else if (!NO_COLOR_NAMES.test(prop) && v.split(/[^a-zA-Z-]+/).some((w) => NAMED_COLORS.has(w.toLowerCase()))) reasons.push('named colour');
  const nonZeroSize = (text) => [...text.matchAll(new RegExp(SIZE_LITERAL, 'g'))].some((m) => parseFloat(m[0]) !== 0);
  if (prop === 'font-size' && (nonZeroSize(v) || SIZE_KEYWORD.test(v))) reasons.push('literal font size');
  else if (prop === 'font' && nonZeroSize(v.split('/')[0])) reasons.push('literal font size');
  return reasons;
}

const COLOR_UTIL = '(?:text|bg|border|border-[trblxy]|fill|stroke|ring|ring-offset|outline|from|via|to|shadow|accent|caret|decoration|divide|placeholder)';
const ARBITRARY = /^(?:[^[\]]|\[[^\]]*\])*?(?<util>[a-z][\w-]*)-\[(?<arg>[^\]]+)\]$/;

/** Reason a Tailwind class token holds a raw arbitrary value, or null. */
export function rawClassReason(token) {
  const m = token.match(ARBITRARY);
  if (!m) return null;
  const { util, arg } = m.groups;
  if (/\b(?:var|url|theme)\(/.test(arg)) return null;
  if ((util === 'duration' || util === 'delay') && !isZero(arg)) return 'literal duration';
  if (util === 'ease') return 'literal easing';
  if (new RegExp(`^${COLOR_UTIL}$`).test(util) && (HEX.test(arg) || COLOR_FN.test(arg) || (arg.startsWith('color:') && /\S/.test(arg.slice(6))))) return 'literal colour';
  if (util === 'text' && /^(?:length:)?-?\d*\.?\d+(?:px|rem|em|pt)$/.test(arg)) return 'literal font size';
  return null;
}

registerCheck({
  id: 'raw-values',
  ruleIds: RAW_VALUES_RULE_IDS,
  run(ctx) {
    const skip = new Set(ctx.config.tokenFiles);
    const out = [];
    for (const file of ctx.files) {
      if (skip.has(file.path)) continue;
      for (const d of fileDecls(file)) {
        if (isCustomProp(d.prop)) continue; // token definitions are allowed anywhere
        const reasons = rawReasons(d.prop, d.value);
        if (reasons.length) out.push({ file: file.path, line: d.line, snippet: declSnippet(d), ruleIds: reasonRuleIds(reasons), message: `raw value (${reasons.join(', ')}); use a --df- token` });
      }
      for (const c of classTokens(file)) {
        const reason = rawClassReason(c.value);
        if (reason) out.push({ file: file.path, line: c.line, snippet: c.value, ruleIds: reasonRuleIds([reason]), message: `Tailwind arbitrary value (${reason}); use a token utility` });
      }
    }
    return out;
  },
});
