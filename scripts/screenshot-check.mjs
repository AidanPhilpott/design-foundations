// Regenerates docs/images/check-output.png from a real run of the checker on examples/demo.
// Needs Playwright (not a dependency of this package): node scripts/screenshot-check.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const cmd = 'design-foundations check --config examples/demo/design-foundations.config.json';
const run = spawnSync(process.execPath,
  ['bin/design-foundations.mjs', 'check', '--config', 'examples/demo/design-foundations.config.json'],
  { encoding: 'utf8' });
const lines = (run.stdout + run.stderr).trimEnd().split('\n');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const body = lines.map((line) => {
  const m = line.match(/^(\S+:\d+)(\s+)(\S+)(\s+)(\[[A-Z]+-\d+\])(\s+)(.*)$/);
  if (!m) return `<span class="sum">${esc(line)}</span>`;
  return `<span class="loc">${esc(m[1])}</span>${m[2]}<span class="chk">${esc(m[3])}</span>${m[4]}` +
    `<span class="id">${esc(m[5])}</span>${m[6]}${esc(m[7])}`;
}).join('\n');

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#e8e8ed;font:13px/1.55 ui-monospace,"DejaVu Sans Mono",Menlo,monospace}
.win{display:inline-block;background:#1c1c1e;color:#e5e5ea;border-radius:12px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,.25)}
.bar{height:36px;background:#2c2c2e;display:flex;align-items:center;gap:8px;padding:0 14px}
.bar i{width:12px;height:12px;border-radius:50%;display:block}
pre{margin:0;padding:16px 20px 20px;white-space:pre}
.p{color:#30d158}.loc{color:#64d2ff}.chk{color:#ffd60a}.id{color:#bf5af2}.sum{color:#ff9f0a;font-weight:700}.ex{color:#8e8e93}
</style><div class="win"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
<pre><span class="p">$</span> ${esc(cmd)}
${body}
<span class="ex">exit ${run.status}</span></pre></div>`;

mkdirSync('docs/images', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(html);
await page.locator('.win').screenshot({ path: 'docs/images/check-output.png' });
await browser.close();
console.log('wrote docs/images/check-output.png');
