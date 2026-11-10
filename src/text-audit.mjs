// Playwright helper: count the distinct text styles, weights and colours visible on the current screen and
// throw when over budget (TYP-18). Takes any object with page.evaluate(fn, arg); does not import playwright.
//
//   await auditTextStyles(page, { maxStyles: 5, maxWeights: 3, maxColours: 3, ignore: ['.g', 'svg'] });
//
// Counted: non-empty text nodes whose element is visible and inside the viewport, and not inside an `ignore` selector.
// Style key: `${fontSize}|${fontWeight}|${textTransform}|mono` (the last part only for a monospace family).
// Colour: the computed `color`, except for text on a filled chip (see the heuristic below).
// Returns {styles, weights, colours}, each an array of {key, count, example}, most used first.

export async function auditTextStyles(page, { maxStyles = 5, maxWeights = 3, maxColours = 3, ignore = [] } = {}) {
  const found = await page.evaluate((ignore) => {
    const MONO = /mono|courier|consolas|menlo|ui-monospace/i;
    const alpha = (c) => {
      const m = /^rgba?\(([^)]+)\)$/.exec(String(c).trim());
      if (!m) return /^transparent$/i.test(String(c).trim()) ? 0 : 1;
      const p = m[1].split(/[,/\s]+/).filter(Boolean);
      return p.length > 3 ? parseFloat(p[3]) : 1;
    };
    const rgb = (c) => String(c).replace(/rgba?\(([^)]+)\)/, (_, v) => v.split(/[,/\s]+/).filter(Boolean).slice(0, 3).join(','));
    const bgOf = (el) => getComputedStyle(el).backgroundColor;
    // Page background: body if it paints one, else the root element, else unknown (null).
    const pageBg = [document.body, document.documentElement].map((e) => e && bgOf(e)).find((c) => c && alpha(c) > 0) ?? null;
    // Filled-chip heuristic: text sits on a chip when its element, or an ancestor within 2 levels, has a
    // background-color with alpha > 0.5 that differs from the page background. Such text (white on a grade
    // colour, dark on lichen) keeps its size/weight in the style count but is left out of the colour count.
    const onChip = (el) => {
      let e = el;
      for (let i = 0; e && i < 3; i++, e = e.parentElement) {
        const bg = bgOf(e);
        if (alpha(bg) > 0.5 && (pageBg === null || rgb(bg) !== rgb(pageBg))) return true;
      }
      return false;
    };
    const ignored = (el) => {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (ignore.some((s) => e.matches(s))) return true;
      return false;
    };
    const hidden = (el) => {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return true;
      }
      return false;
    };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const styles = new Map();
    const weights = new Map();
    const colours = new Map();
    const bump = (map, key, text) => {
      const e = map.get(key);
      if (e) e.count += 1;
      else map.set(key, { key, count: 1, example: text });
    };
    const visit = (node) => {
      if (node.nodeType === 3) {
        const text = (node.nodeValue ?? '').replace(/\s+/g, ' ').trim();
        const el = node.parentElement;
        if (!text || !el) return;
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'noscript') return;
        const r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return;
        if (r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh) return;
        if (hidden(el) || ignored(el)) return;
        const s = getComputedStyle(el);
        const example = text.length > 30 ? `${text.slice(0, 29)}…` : text;
        bump(styles, `${s.fontSize}|${s.fontWeight}|${s.textTransform}|${MONO.test(s.fontFamily) ? 'mono' : 'sans'}`, example);
        bump(weights, String(s.fontWeight), example);
        if (!onChip(el)) bump(colours, s.color, example);
        return;
      }
      if (node.nodeType === 1) for (const c of node.childNodes) visit(c);
    };
    visit(document.body);
    const list = (m) => [...m.values()].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
    return { styles: list(styles), weights: list(weights), colours: list(colours) };
  }, ignore);

  const budgets = [['styles', 'text styles', maxStyles], ['weights', 'font weights', maxWeights], ['colours', 'text colours', maxColours]];
  const over = budgets.filter(([k, , max]) => found[k].length > max);
  if (over.length) {
    const lines = over.map(([k, label, max]) =>
      [`${found[k].length} ${label} (max ${max}):`, ...found[k].map((e) => `  ${e.key} ×${e.count} "${e.example}"`)].join('\n'));
    throw new Error(`text style budget exceeded (TYP-18)\n${lines.join('\n')}`);
  }
  return found;
}
