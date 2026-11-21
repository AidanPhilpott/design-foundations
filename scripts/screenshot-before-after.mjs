// Regenerates docs/images/before-after.png: the two screens in examples/before-after, side by side,
// captioned with real results from the checker, auditTextStyles (TYP-18) and assertTargets (ACC-04).
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
const W = 390;

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
  const page = await browser.newPage({ viewport: { width: W, height: 800 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await page.goto(pathToFileURL(path.join(dir, v, 'index.html')).href);
  const styles = (await auditTextStyles(page, { maxStyles: 99, maxWeights: 99, maxColours: 99, ignore: ['svg'] })).styles.length;
  let small = 0;
  try { await assertTargets(page); } catch (e) { small = Number(/(\d+) interactive/.exec(e.message)?.[1] ?? 0); }
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: W, height } });
  shots[v] = { png: png.toString('base64'), height, findings: checker(v), styles, small };
  await page.close();
}

const H = Math.max(shots.before.height, shots.after.height);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const col = (v, title) => {
  const s = shots[v];
  const facts = [plural(s.findings, 'checker finding'), plural(s.styles, 'text style'),
    s.small ? `${plural(s.small, 'tap target')} under 44px` : 'every tap target 44px or larger'];
  return `<figure><div class="phone" style="height:${H}px"><img src="data:image/png;base64,${s.png}" width="${W}"></div>
  <figcaption><strong>${title}</strong><span>${facts.join(' · ')}</span></figcaption></figure>`;
};

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#e7e5e0;color:#1c1a17}
.wrap{display:inline-flex;gap:48px;padding:48px 56px 40px}
figure{margin:0;display:flex;flex-direction:column;gap:20px}
.phone{width:${W}px;border-radius:44px;overflow:hidden;background:#fff;box-shadow:0 0 0 10px #1c1a17,0 24px 48px rgba(0,0,0,.25)}
img{display:block}
figcaption{display:flex;flex-direction:column;gap:4px;padding-top:12px;text-align:center}
strong{font-size:17px;font-weight:600}
span{font-size:14px;color:#5a554c}
</style><div class="wrap">${col('before', 'Before')}${col('after', 'After design-foundations')}</div>`;

mkdirSync('docs/images', { recursive: true });
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(html);
await page.locator('.wrap').screenshot({ path: 'docs/images/before-after.png' });
await browser.close();
for (const v of ['before', 'after']) {
  const { findings, styles, small } = shots[v];
  console.log(`${v}: ${findings} findings, ${styles} text styles, ${small} small targets`);
}
console.log('wrote docs/images/before-after.png');
