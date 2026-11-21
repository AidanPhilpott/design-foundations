// safe-area: viewport-fit=cover lets a page draw under the status bar, camera cutout and home indicator, so the
// project must pad for them with env(safe-area-inset-*). Flags each cover declaration (viewport meta, or a
// Next.js `viewportFit: 'cover'` export) when some side's inset is never used in any checked file.
import { registerCheck } from './registry.mjs';

export const SAFE_AREA_RULE_IDS = ['LAY-01'];
const SIDES = ['top', 'right', 'bottom', 'left'];

/** Blank out comments, keeping newlines so line numbers survive. `//` after a colon (a URL) is left alone. */
const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(^|[^:\\])\/\/[^\n]*/g, (m, pre) =>
    (pre ?? '') + m.slice((pre ?? '').length).replace(/[^\n]/g, ' '));

const META = /<meta\b[^>]*>/gi;
const isViewportMeta = (tag) => /\bname\s*=\s*["']?viewport\b/i.test(tag);
const coverInMeta = (tag) => /\bviewport-fit\s*=\s*cover\b/i.test(tag);
const NEXT_COVER = /\bviewportFit\s*:\s*["'`]cover["'`]/g;
const INSET = /\b(?:env|constant)\(\s*safe-area-(?:max-)?inset-(top|right|bottom|left)\b/gi;

const lineAt = (text, index) => text.slice(0, index).split('\n').length;
const squash = (s) => s.replace(/\s+/g, ' ').trim();

registerCheck({
  id: 'safe-area',
  ruleIds: SAFE_AREA_RULE_IDS,
  run(ctx) {
    const used = new Set();
    const covers = [];
    for (const file of ctx.files) {
      const text = stripComments(file.text);
      for (const m of text.matchAll(INSET)) used.add(m[1].toLowerCase());
      if (file.kind === 'html' || file.kind === 'js') {
        for (const m of text.matchAll(META)) {
          if (isViewportMeta(m[0]) && coverInMeta(m[0])) covers.push({ file: file.path, line: lineAt(text, m.index), snippet: squash(m[0]) });
        }
      }
      if (file.kind === 'js') {
        for (const m of text.matchAll(NEXT_COVER)) covers.push({ file: file.path, line: lineAt(text, m.index), snippet: squash(m[0]) });
      }
    }
    const missing = SIDES.filter((s) => !used.has(s));
    if (!missing.length) return [];
    return covers.map((c) => ({
      ...c,
      message: `viewport-fit=cover, but env(safe-area-inset-*) is never used for ${missing.join(', ')}; ` +
        'content can sit under the status bar, camera cutout or home indicator (add the insets to padding)',
    }));
  },
});
