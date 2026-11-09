// Playwright helper: fail when a visible interactive element is smaller than `min` CSS px in either dimension.
// Takes any object with page.evaluate(fn, arg); does not import playwright.
const INTERACTIVE = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [role=menuitem]';

export async function assertTargets(page, { min = 44, allow = [] } = {}) {
  const boxes = await page.evaluate(({ selector, allow }) => {
    const out = [];
    for (const el of document.querySelectorAll(selector)) {
      if (allow.some((s) => el.matches(s))) continue;
      const r = el.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      const tag = el.tagName.toLowerCase();
      const name = el.id ? `${tag}#${el.id}` : el.classList && el.classList[0] ? `${tag}.${el.classList[0]}` : tag;
      out.push({ selector: name, width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10 });
    }
    return out;
  }, { selector: INTERACTIVE, allow });
  const small = boxes.filter((b) => b.width < min || b.height < min);
  if (small.length) {
    throw new Error(`${small.length} interactive element(s) smaller than ${min}x${min}:\n${small.map((b) => `  ${b.selector} ${b.width}x${b.height}`).join('\n')}`);
  }
  return [];
}
