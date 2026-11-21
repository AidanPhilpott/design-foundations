// Regenerates docs/images/before-after.png: the two screens in examples/before-after, side by side,
// captioned with real results from the checker, auditTextStyles (TYP-18), assertTargets (ACC-04) and a
// safe-area check (LAY-01). Pages render with iPhone safe-area insets emulated, and the status bar, camera
// cutout and home indicator are drawn on top, so anything that ignores env(safe-area-inset-*) shows up under them.
// Needs Playwright (not a dependency of this package): node scripts/screenshot-before-after.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { auditTextStyles } from '../dist/text-audit.mjs';
import { assertTargets } from '../dist/targets-runtime.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.resolve('examples/before-after');
const W = 393;
const INSET = { top: 59, bottom: 34, left: 0, right: 0 }; // iPhone 15 Pro, portrait

function checker(v) {
  const r = spawnSync(process.execPath, ['bin/design-foundations.mjs', 'check', '--config',
    path.join(dir, v, 'design-foundations.config.json')], { encoding: 'utf8' });
  const m = /(\d+) new/.exec(r.stdout);
  if (!m) throw new Error(`checker gave no summary for ${v}:\n${r.stdout}${r.stderr}`);
  return Number(m[1]);
}

const browser = await chromium.launch();
const shots = {};
for (const v of ['before', 'after']) {
  const page = await browser.newPage({ viewport: { width: W, height: 852 }, deviceScaleFactor: 2, colorScheme: 'light' });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: INSET });
  await page.goto(pathToFileURL(path.join(dir, v, 'index.html')).href);
  const styles = (await auditTextStyles(page, { maxStyles: 99, maxWeights: 99, maxColours: 99, ignore: ['svg'] })).styles.length;
  let small = 0;
  try { await assertTargets(page); } catch (e) { small = Number(/(\d+) interactive/.exec(e.message)?.[1] ?? 0); }
  const unsafe = await page.evaluate((top) => [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.height && r.top < top; }).length, INSET.top);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: W, height } });
  shots[v] = { png: png.toString('base64'), height, findings: checker(v), styles, small, unsafe };
  await page.close();
}

const H = Math.max(shots.before.height, shots.after.height);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const statusBar = (ink) => `<div class="sb" style="color:${ink}"><b>9:41</b><i class="island"></i>
  <svg width="74" height="13" viewBox="0 0 74 13" fill="currentColor" aria-hidden="true">
    <rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.5" y="6" width="3" height="6" rx="1"/><rect x="9" y="3.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="1" width="3" height="11" rx="1"/>
    <path d="M30 3.2a10 10 0 0 1 13 0l-1.3 1.4a8 8 0 0 0-10.4 0zm2.4 2.6a6.4 6.4 0 0 1 8.2 0l-1.3 1.4a4.4 4.4 0 0 0-5.6 0zm2.4 2.6a2.8 2.8 0 0 1 3.4 0L36.5 10z"/>
    <rect x="49.5" y="1" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="51.5" y="3" width="15" height="7" rx="2"/><rect x="71.5" y="4.5" width="1.5" height="4" rx=".75" fill-opacity=".4"/>
  </svg></div>`;
const col = (v, title, ink, homeInk = ink) => {
  const s = shots[v];
  const line1 = [plural(s.findings, 'checker finding'), plural(s.styles, 'text style')];
  const line2 = [s.small ? `${plural(s.small, 'tap target')} under 44px` : 'every tap target 44px or larger',
    s.unsafe ? `${plural(s.unsafe, 'control')} under the status bar` : 'nothing under the status bar'];
  return `<figure><div class="phone" style="height:${H}px"><img src="data:image/png;base64,${s.png}" width="${W}">
  ${statusBar(ink)}<i class="home" style="background:${homeInk}"></i></div>
  <figcaption><strong>${title}</strong><span>${line1.join(' · ')}</span><span>${line2.join(' · ')}</span></figcaption></figure>`;
};

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#e7e5e0;color:#1c1a17}
.wrap{display:inline-flex;gap:48px;padding:48px 56px 40px}
figure{margin:0;display:flex;flex-direction:column;gap:20px}
.phone{position:relative;width:${W}px;border-radius:44px;overflow:hidden;background:#fff;box-shadow:0 0 0 10px #1c1a17,0 24px 48px rgba(0,0,0,.25)}
img{display:block}
.sb{position:absolute;inset:0 0 auto;height:${INSET.top}px;display:flex;align-items:center;justify-content:space-between;padding:0 34px 0 52px;box-sizing:border-box}
.sb b{font-size:17px;font-weight:600}
.island{position:absolute;top:11px;left:50%;width:126px;height:37px;margin-left:-63px;border-radius:20px;background:#000}
.home{position:absolute;bottom:8px;left:50%;width:134px;height:5px;margin-left:-67px;border-radius:3px}
figcaption{display:flex;flex-direction:column;gap:4px;padding-top:12px;text-align:center}
strong{font-size:17px;font-weight:600}
span{font-size:14px;color:#5a554c}
</style><div class="wrap">${col('before', 'Before', '#fff', '#2d2b55')}${col('after', 'After design-foundations', '#1c1a17')}</div>`;

mkdirSync('docs/images', { recursive: true });
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(html);
await page.locator('.wrap').screenshot({ path: 'docs/images/before-after.png' });
await browser.close();
for (const v of ['before', 'after']) {
  const { findings, styles, small, unsafe } = shots[v];
  console.log(`${v}: ${findings} findings, ${styles} text styles, ${small} small targets, ${unsafe} controls under the status bar`);
}
console.log('wrote docs/images/before-after.png');
