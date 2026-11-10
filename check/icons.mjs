// icons: manifest has 192 + 512 + maskable 512 PNG icons; an apple-touch-icon 180 PNG is linked and has no alpha.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { registerCheck } from './registry.mjs';

const isFile = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

export const ICONS_RULE_IDS = ['ICO-01', 'ICO-02'];

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Read a PNG: {width, height, colorType, hasTrns} or null when it is not a PNG. */
export function readPng(buf) {
  if (buf.length < 33 || !buf.subarray(0, 8).equals(SIG) || buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  const info = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25], hasTrns: false };
  for (let i = 8; i + 8 <= buf.length; ) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString('ascii', i + 4, i + 8);
    if (type === 'tRNS') info.hasTrns = true;
    if (type === 'IDAT' || type === 'IEND') break;
    i += 12 + len;
  }
  return info;
}
/** Colour types 4 and 6 carry alpha; palette (3) only with a tRNS chunk. */
export const pngHasAlpha = (p) => p.colorType === 4 || p.colorType === 6 || (p.colorType === 3 && p.hasTrns);

const sizesOf = (icon) => String(icon.sizes ?? '').split(/\s+/).filter(Boolean).map((s) => s.toLowerCase());
const lineOfText = (text, needle) => {
  const i = text.indexOf(needle);
  return i < 0 ? 1 : text.slice(0, i).split('\n').length;
};

function checkManifest(config, out) {
  const rel = config.manifest;
  const abs = resolve(config.dir, rel);
  if (!existsSync(abs)) {
    out.push({ file: rel, line: 1, snippet: 'manifest missing', message: `manifest ${rel} not found`, ruleIds: ['ICO-01'] });
    return;
  }
  const text = readFileSync(abs, 'utf8');
  let icons;
  try {
    icons = JSON.parse(text).icons;
  } catch (e) {
    out.push({ file: rel, line: 1, snippet: 'manifest unparseable', message: `cannot parse ${rel}: ${e.message}`, ruleIds: ['ICO-01'] });
    return;
  }
  icons = Array.isArray(icons) ? icons : [];
  const has = (size, maskable) => icons.some((ic) => sizesOf(ic).includes(`${size}x${size}`) && (!maskable || /\bmaskable\b/.test(ic.purpose ?? '')));
  const need = [[192, false, 'a 192x192 icon'], [512, false, 'a 512x512 icon'], [512, true, 'a 512x512 icon with purpose "maskable"']];
  for (const [size, maskable, what] of need) {
    if (!has(size, maskable)) out.push({ file: rel, line: 1, snippet: `missing ${size}${maskable ? ' maskable' : ''}`, message: `manifest needs ${what}`, ruleIds: ['ICO-01'] });
  }
  for (const ic of icons) {
    if (typeof ic.src !== 'string' || /^(?:[a-z]+:|\/\/|data:)/i.test(ic.src)) continue;
    if (!isFile(resolve(dirname(abs), ic.src.split(/[?#]/)[0].replace(/^\//, '')))) {
      out.push({ file: rel, line: lineOfText(text, ic.src), snippet: `missing file ${ic.src}`, message: `manifest icon ${ic.src} does not exist or is not a file`, ruleIds: ['ICO-01'] });
    }
  }
}

function checkTouchIcon(ctx, out) {
  const { config } = ctx;
  const links = [];
  for (const f of ctx.files) {
    if (f.kind !== 'html') continue;
    for (const m of f.text.matchAll(/<link\b[^>]*>/gi)) {
      if (!/\brel\s*=\s*["']?[^"'>]*apple-touch-icon/i.test(m[0])) continue;
      const href = m[0].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      links.push({ file: f.path, line: f.text.slice(0, m.index).split('\n').length, href: href ? (href[1] ?? href[2] ?? href[3]) : '' });
    }
  }
  // Nothing to say about a project that has neither HTML nor a manifest (nothing to link an icon from).
  if (!links.length && (config.manifest || ctx.files.some((f) => f.kind === 'html'))) {
        out.push({ file: config.manifest ?? 'index.html', line: 1, snippet: 'no apple-touch-icon', message: 'no <link rel="apple-touch-icon"> found in the HTML files', ruleIds: ['ICO-02'] });
    return;
  }
  for (const l of links) {
    const fail = (snippet, message) => out.push({ file: l.file, line: l.line, snippet, message, ruleIds: ['ICO-02'] });
    if (!l.href || /^(?:[a-z]+:|\/\/|data:)/i.test(l.href)) continue;
    const clean = l.href.split(/[?#]/)[0];
    const abs = clean.startsWith('/') ? join(config.dir, clean) : resolve(config.dir, dirname(l.file), clean);
    if (!isFile(abs)) { fail(`missing file ${l.href}`, `apple-touch-icon ${l.href} does not exist or is not a file`); continue; }
    let p = null;
    try {
      p = readPng(readFileSync(abs));
    } catch {
      fail(`unreadable ${l.href}`, `apple-touch-icon ${l.href} is not a readable PNG file`);
      continue;
    }
    if (!p) { fail(`not a PNG ${l.href}`, `apple-touch-icon ${l.href} is not a PNG`); continue; }
    if (p.width !== 180 || p.height !== 180) fail(`size ${l.href}`, `apple-touch-icon ${l.href} is ${p.width}x${p.height}, needs 180x180`);
    if (pngHasAlpha(p)) fail(`alpha ${l.href}`, `apple-touch-icon ${l.href} has an alpha channel; iOS fills transparency with black, so export it opaque`);
  }
}

registerCheck({
  id: 'icons',
  ruleIds: ICONS_RULE_IDS,
  run(ctx) {
    const out = [];
    if (ctx.config.manifest) checkManifest(ctx.config, out);
    checkTouchIcon(ctx, out);
    return out;
  },
});
