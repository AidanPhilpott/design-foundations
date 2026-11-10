import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { deflateSync } from 'node:zlib';

import { getChecks } from '../check/index.mjs';
import { evaluate } from '../check/core.mjs';
import { CONTRAST_RULE_IDS } from '../check/contrast.mjs';
import { ICONS_RULE_IDS } from '../check/icons.mjs';
import { TARGETS_RULE_IDS } from '../check/targets.mjs';
import { assertTargets } from '../src/targets-runtime.mjs';

// ---- helpers ----
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data = Buffer.alloc(0)) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
/** Minimal valid PNG: signature + IHDR (given colour type) + optional extra chunks + IEND. */
function png(size, colorType, extra = []) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), ...extra, chunk('IDAT', deflateSync(Buffer.alloc(1))), chunk('IEND')]);
}

function run(files, config = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'df-assets-'));
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), content);
  }
  const cfg = { include: ['**/*.{css,html}'], ...config };
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify(cfg));
  return evaluate(join(dir, 'design-foundations.config.json'));
}
const of = (r, id) => r.findings.filter((f) => f.check === id);

// ---- registration ----
test('contrast, icons, targets register with their rule ids', () => {
  const ids = (id) => getChecks().find((c) => c.id === id).ruleIds;
  assert.deepEqual(ids('contrast'), ['COL-01', 'ACC-03']);
  assert.deepEqual(ids('icons'), ['ICO-01', 'ICO-02']);
  assert.deepEqual(ids('targets'), ['ACC-04']);
  assert.deepEqual(CONTRAST_RULE_IDS, ['COL-01', 'ACC-03']);
  assert.deepEqual(ICONS_RULE_IDS, ['ICO-01', 'ICO-02']);
  assert.deepEqual(TARGETS_RULE_IDS, ['ACC-04']);
});

// ---- contrast ----
const GOOD = { light: '#000000', dark: '#ffffff' };
const BG = { light: '#ffffff', dark: '#000000' };
function project(over = {}) {
  const roles = {};
  for (const r of ['bg.primary', 'bg.secondary', 'bg.tertiary', 'bg.grouped.primary', 'bg.grouped.secondary', 'bg.grouped.tertiary']) roles[r] = BG;
  for (const r of ['label.primary', 'label.secondary', 'label.tertiary', 'link', 'separator']) roles[r] = GOOD;
  roles.accent = { light: '#000000', dark: '#000000' };
  roles['accent.on'] = { light: '#ffffff', dark: '#ffffff' };
  for (const r of ['success', 'warning', 'danger', 'info']) roles[`status.${r}`] = GOOD;
  return { modes: ['light', 'dark'], roles: { ...roles, ...over } };
}
const cfgC = { projectTokens: 'colors.json', checks: { contrast: 'error' } };

test('contrast reports fail with ratio and pair', () => {
  const p = project({ 'label.secondary': { light: '#cccccc', dark: '#ffffff' } });
  const r = run({ 'colors.json': JSON.stringify(p, null, 2) }, cfgC);
  const f = of(r, 'contrast').filter((x) => /label\.secondary on bg\.primary \(light\)/.test(x.snippet));
  assert.equal(f.length, 1);
  assert.equal(f[0].severity, 'error');
  assert.equal(f[0].file, 'colors.json');
  assert.equal(f[0].snippet, 'label.secondary on bg.primary (light)');
  assert.match(f[0].message, /1\.6\d:1.*4\.5/);
  assert.deepEqual(f[0].ruleIds, ['COL-01']);
  assert.ok(f[0].line > 1, 'line of the fg role key');
  assert.match(JSON.stringify(p, null, 2).split('\n')[f[0].line - 1], /"label\.secondary"/);
  // passing pairs produce nothing
  assert.ok(of(r, 'contrast').every((x) => /label\.secondary/.test(x.snippet)));
});

test('non-text pair failure uses ACC-03', () => {
  const p = project({ 'status.danger': { light: '#eeeeee', dark: '#ffffff' } });
  const r = run({ 'colors.json': JSON.stringify(p) }, cfgC);
  const f = of(r, 'contrast').find((x) => x.snippet === 'status.danger on bg.primary (light)');
  assert.deepEqual(f.ruleIds, ['ACC-03']);
});

test('contrast rule id follows the foreground role, not the pair minimum', () => {
  const p = project({
    'label.tertiary': { light: '#eeeeee', dark: '#ffffff' },
    link: { light: '#eeeeee', dark: '#ffffff' },
    'accent.on': { light: '#000000', dark: '#ffffff' },
    separator: { light: '#ffffff', dark: '#ffffff' },
  });
  p.pairs = [{ fg: 'separator', bg: 'bg.primary', min: 4.5 }];
  const r = run({ 'colors.json': JSON.stringify(p) }, cfgC);
  const id = (snip) => of(r, 'contrast').find((x) => x.snippet === snip)?.ruleIds;
  assert.deepEqual(id('label.tertiary on bg.primary (light)'), ['COL-01'], 'text at 3:1 is still text');
  assert.deepEqual(id('link on bg.primary (light)'), ['COL-01']);
  assert.deepEqual(id('accent.on on accent (light)'), ['COL-01']);
  assert.deepEqual(id('separator on bg.primary (light)'), ['ACC-03'], 'non-text at 4.5:1 is still non-text');
});

test('unresolvable colour is an error, not a pass', () => {
  const p = project({ 'label.primary': { light: 'var(--x)', dark: '#ffffff' } });
  const r = run({ 'colors.json': JSON.stringify(p) }, { ...cfgC, checks: { contrast: 'warn' } });
  const f = of(r, 'contrast').filter((x) => /unresolvable/.test(x.message));
  assert.ok(f.length >= 1);
  assert.ok(f.every((x) => x.severity === 'error'));
  assert.equal(f[0].snippet, 'label.primary on bg.primary (light)');
});

test('missing role/slot is a warn even when the check is error', () => {
  const p = project();
  delete p.roles['label.tertiary'];
  const r = run({ 'colors.json': JSON.stringify(p) }, cfgC);
  const m = of(r, 'contrast').filter((x) => /missing/.test(x.message));
  assert.ok(m.length >= 1);
  assert.ok(m.every((x) => x.severity === 'warn'));
  assert.ok(m.some((x) => x.snippet === 'label.tertiary (missing role)'));
  assert.equal(r.fresh.filter((x) => x.severity === 'error').length, 0);
});

test('contrast produces nothing without projectTokens', () => {
  const r = run({ 'a.css': 'a{color:red}' }, { checks: { contrast: 'error' } });
  assert.deepEqual(of(r, 'contrast'), []);
});

test('fingerprint is stable when the failing values change', () => {
  const a = run({ 'colors.json': JSON.stringify(project({ link: { light: '#dddddd', dark: '#fff' } })) }, cfgC);
  const b = run({ 'colors.json': JSON.stringify(project({ link: { light: '#cccccc', dark: '#fff' } })) }, cfgC);
  const fp = (r) => of(r, 'contrast').find((x) => x.snippet === 'link on bg.primary (light)').fingerprint;
  assert.equal(fp(a), fp(b));
});

// ---- icons ----
const manifest = (icons) => JSON.stringify({ icons });
const goodIcons = [
  { src: 'icons/192.png', sizes: '192x192', type: 'image/png' },
  { src: 'icons/512.png', sizes: '512x512', type: 'image/png' },
  { src: 'icons/512m.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];
const iconFiles = { 'public/icons/192.png': png(192, 2), 'public/icons/512.png': png(512, 2), 'public/icons/512m.png': png(512, 2) };
const html = (href = 'touch.png') => `<!doctype html><link rel="apple-touch-icon" href="${href}" sizes="180x180"><p>x</p>`;
const cfgI = { manifest: 'public/manifest.webmanifest', checks: { icons: 'error' } };

test('icons passes a complete set', () => {
  const r = run({ ...iconFiles, 'public/manifest.webmanifest': manifest(goodIcons), 'public/index.html': html(), 'public/touch.png': png(180, 2) }, cfgI);
  assert.deepEqual(of(r, 'icons'), []);
});

test('icons flags missing maskable', () => {
  const icons = goodIcons.slice(0, 2);
  const r = run({ ...iconFiles, 'public/manifest.webmanifest': manifest(icons), 'public/index.html': html(), 'public/touch.png': png(180, 2) }, cfgI);
  const f = of(r, 'icons');
  assert.equal(f.length, 1);
  assert.match(f[0].message, /maskable/);
  assert.deepEqual(f[0].ruleIds, ['ICO-01']);
  assert.equal(f[0].file, 'public/manifest.webmanifest');
});

test('icons flags missing 192 and 512, and a missing referenced file', () => {
  const r = run({ 'public/manifest.webmanifest': manifest([{ src: 'gone.png', sizes: '48x48', purpose: 'any maskable' }]), 'public/index.html': html(), 'public/touch.png': png(180, 2) }, cfgI);
  const msgs = of(r, 'icons').map((f) => f.message).join('\n');
  assert.match(msgs, /192/);
  assert.match(msgs, /512/);
});

test('icons flags a manifest icon file that does not exist', () => {
  const r = run({ ...iconFiles, 'public/manifest.webmanifest': manifest([...goodIcons, { src: 'icons/nope.png', sizes: '256x256' }]), 'public/index.html': html(), 'public/touch.png': png(180, 2) }, cfgI);
  const f = of(r, 'icons');
  assert.equal(f.length, 1);
  assert.match(f[0].message, /nope\.png/);
});

test('icons flags apple-touch-icon with alpha', () => {
  for (const type of [6, 4]) {
    const r = run({ ...iconFiles, 'public/manifest.webmanifest': manifest(goodIcons), 'public/index.html': html(), 'public/touch.png': png(180, type) }, cfgI);
    const f = of(r, 'icons');
    assert.equal(f.length, 1, `colour type ${type}`);
    assert.deepEqual(f[0].ruleIds, ['ICO-02']);
    assert.equal(f[0].file, 'public/index.html');
    assert.match(f[0].message, /alpha/);
  }
});

test('palette PNG has alpha only when a tRNS chunk exists', () => {
  const files = { ...iconFiles, 'public/manifest.webmanifest': manifest(goodIcons), 'public/index.html': html() };
  const plain = run({ ...files, 'public/touch.png': png(180, 3) }, cfgI);
  assert.deepEqual(of(plain, 'icons'), []);
  const trns = run({ ...files, 'public/touch.png': png(180, 3, [chunk('tRNS', Buffer.from([0]))]) }, cfgI);
  assert.equal(of(trns, 'icons').length, 1);
});

test('icons flags a missing apple-touch-icon link, wrong size, and missing file', () => {
  const base = { ...iconFiles, 'public/manifest.webmanifest': manifest(goodIcons) };
  const none = run({ ...base, 'public/index.html': '<!doctype html><p>x</p>' }, cfgI);
  assert.match(of(none, 'icons')[0].message, /apple-touch-icon/);
  const small = run({ ...base, 'public/index.html': html(), 'public/touch.png': png(120, 2) }, cfgI);
  assert.match(of(small, 'icons')[0].message, /180/);
  const gone = run({ ...base, 'public/index.html': html('nofile.png') }, cfgI);
  assert.match(of(gone, 'icons')[0].message, /nofile\.png/);
});

test('icons: directory, non-PNG and truncated PNG hrefs report instead of crashing', () => {
  const base = { ...iconFiles, 'public/manifest.webmanifest': manifest(goodIcons) };
  for (const href of ['sub', '/', './']) {
    const r = run({ ...base, 'public/index.html': html(href), 'public/sub/keep.txt': 'x' }, cfgI);
    const f = of(r, 'icons');
    assert.equal(f.length, 1, href);
    assert.match(f[0].message, /not a file|readable/);
  }
  const txt = run({ ...base, 'public/index.html': html(), 'public/touch.png': 'hello, not a png at all, definitely more than 33 bytes long' }, cfgI);
  assert.match(of(txt, 'icons')[0].message, /not a PNG/);
  const cut = run({ ...base, 'public/index.html': html(), 'public/touch.png': png(180, 2).subarray(0, 40) }, cfgI);
  assert.ok(Array.isArray(of(cut, 'icons'))); // reaching here means it did not throw
  const tiny = run({ ...base, 'public/index.html': html(), 'public/touch.png': png(180, 2).subarray(0, 20) }, cfgI);
  assert.match(of(tiny, 'icons')[0].message, /not a PNG/);
  const dirIcon = run({ ...iconFiles, 'public/manifest.webmanifest': manifest(goodIcons.map((i) => (i.purpose ? { ...i, src: 'icons' } : i))), 'public/index.html': html(), 'public/touch.png': png(180, 2) }, cfgI);
  assert.match(of(dirIcon, 'icons')[0].message, /not a file/);
});

test('icons without a manifest checks only apple-touch-icon', () => {
  const r = run({ 'index.html': html(), 'touch.png': png(180, 6) }, { checks: { icons: 'error' } });
  const f = of(r, 'icons');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].ruleIds, ['ICO-02']);
});

// ---- targets (static) ----
const tgt = (css, config = {}) => of(run({ 'a.css': css }, { checks: { targets: 'error' }, ...config }), 'targets');

test('targets flags 32px button', () => {
  const f = tgt('.x {}\nbutton { height: 32px; }\n');
  assert.equal(f.length, 1);
  assert.equal(f[0].snippet, 'button { height: 32px }');
  assert.equal(f[0].line, 2);
  assert.deepEqual(f[0].ruleIds, ['ACC-04']);
});

test('targets: rem x16, width as well, min-height >= 44 rescues that dimension only', () => {
  assert.equal(tgt('button { width: 2rem; }').length, 1);
  assert.equal(tgt('button { height: 30px; min-height: 44px; }').length, 0);
  assert.equal(tgt('button { height: 30px; min-height: 2.75rem; }').length, 0);
  assert.equal(tgt('button { height: 30px; min-width: 44px; }').length, 1);
  assert.equal(tgt('button { min-height: 40px; }').length, 1);
  assert.equal(tgt('button { height: 44px; width: 44px; }').length, 0);
});

test('targets: selectors, config classes, role/attr, lists', () => {
  assert.equal(tgt('[role=button] { height: 20px }').length, 1);
  assert.equal(tgt('input[type=checkbox] { width: 16px }').length, 1);
  assert.equal(tgt('summary, .card { height: 20px }').length, 1);
  assert.equal(tgt('.card { height: 20px }').length, 0);
  assert.equal(tgt('.chip { height: 20px }', { targetSelectors: ['.chip'] }).length, 1);
  assert.equal(tgt('div { height: 20px }').length, 0);
  assert.equal(tgt('@media (min-width: 600px) { button { height: 20px } }').length, 1);
});

test('targets: inline links only when made block-ish or explicitly sized', () => {
  assert.equal(tgt('a { color: red; text-decoration: none }').length, 0);
  assert.equal(tgt('a { min-height: 30px }').length, 0, 'min-* alone on a plain inline link is out of scope');
  assert.equal(tgt('a { display: block; min-height: 30px }').length, 1);
  assert.equal(tgt('a { display: inline-block; height: 20px }').length, 1);
  assert.equal(tgt('a { height: 20px }').length, 1, 'explicit height counts');
  assert.equal(tgt('a { display: flex; width: 10px }').length, 1);
  assert.equal(tgt('a:hover { color: red }').length, 0);
});

test('targets ignores custom properties and comments', () => {
  assert.equal(tgt('button { --h: 20px; } /* button { height: 20px } */').length, 0);
});

// ---- assertTargets ----
const fakePage = (boxes) => ({
  calls: 0,
  async evaluate(fn, arg) {
    this.calls++;
    // Emulate the in-page function against a minimal fake DOM described by `boxes`.
    const { document, getComputedStyle } = fakeDom(boxes);
    const g = globalThis;
    const saved = [g.document, g.getComputedStyle];
    g.document = document;
    g.getComputedStyle = getComputedStyle;
    try {
      return fn(arg);
    } finally {
      [g.document, g.getComputedStyle] = saved;
    }
  },
});
function fakeDom(boxes) {
  const els = boxes.map((b) => ({
    tagName: (b.tag ?? 'button').toUpperCase(),
    id: b.id ?? '',
    classList: b.cls ? [b.cls] : [],
    _b: b,
    matches: (sel) => (b.matches ?? []).includes(sel),
    getBoundingClientRect: () => ({ width: b.w, height: b.h }),
  }));
  return {
    document: { querySelectorAll: () => els },
    getComputedStyle: (el) => ({ visibility: el._b.hidden ? 'hidden' : 'visible' }),
  };
}

test('assertTargets returns small elements by throwing a list', async () => {
  const page = fakePage([
    { tag: 'button', id: 'ok', w: 48, h: 48 },
    { tag: 'button', cls: 'tiny', w: 30, h: 44 },
    { tag: 'a', id: 'link', w: 100, h: 20 },
    { tag: 'button', id: 'hid', w: 10, h: 10, hidden: true },
    { tag: 'button', id: 'zero', w: 0, h: 0 },
  ]);
  await assert.rejects(() => assertTargets(page), (e) => {
    assert.ok(e instanceof Error);
    assert.match(e.message, /button\.tiny 30x44/);
    assert.match(e.message, /a#link 100x20/);
    assert.doesNotMatch(e.message, /hid|zero|#ok/);
    return true;
  });
  assert.equal(page.calls, 1);
});

test('assertTargets returns [] when all pass, honours min and allow', async () => {
  const boxes = [{ tag: 'button', id: 'a', w: 50, h: 50 }, { tag: 'button', id: 'small', w: 30, h: 30, matches: ['.skip'] }];
  assert.deepEqual(await assertTargets(fakePage(boxes), { allow: ['.skip'] }), []);
  await assert.rejects(() => assertTargets(fakePage(boxes)), /button#small 30x30/);
  assert.deepEqual(await assertTargets(fakePage([{ tag: 'button', id: 'a', w: 30, h: 30 }]), { min: 24 }), []);
});
