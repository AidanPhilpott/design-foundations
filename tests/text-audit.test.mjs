import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseTokens } from '../build/build.mjs';
import { auditTextStyles } from '../src/text-audit.mjs';

test('role tokens resolve to spec values', () => {
  const t = baseTokens();
  const v = (r) => t.get(`type.role.${r}`).value;
  assert.deepEqual(v('title'), { size: 28, leading: 34, weight: 700, tracking: 0, transform: 'none' });
  assert.deepEqual(v('headline'), { size: 17, leading: 22, weight: 600, tracking: 0, transform: 'none' });
  assert.deepEqual(v('body'), { size: 15, leading: 20, weight: 400, tracking: 0, transform: 'none' });
  assert.deepEqual(v('footnote'), { size: 13, leading: 18, weight: 400, tracking: 0, transform: 'none' });
  assert.deepEqual(v('label'), { size: 12, leading: 16, weight: 600, tracking: 0.06, transform: 'uppercase' });
});

// ---- fake DOM: elements {text, fs, fw, tt, ff, color, bg, cls, rect, display, children, parent} ----
function dom(items) {
  const mk = (o, parent) => {
    const el = {
      nodeType: 1, tagName: (o.tag ?? 'div').toUpperCase(), parentElement: parent, o,
      matches: (s) => s.startsWith('.') && (o.cls ?? '').split(' ').includes(s.slice(1)),
      getBoundingClientRect: () => o.rect ?? { width: 100, height: 20, left: 10, top: 10, right: 110, bottom: 30 },
    };
    el.childNodes = [
      ...(o.text ? [{ nodeType: 3, nodeValue: o.text, parentElement: el }] : []),
      ...(o.children ?? []).map((c) => mk(c, el)),
    ];
    return el;
  };
  const body = mk({ tag: 'body', bg: 'rgb(255, 255, 255)', children: items }, null);
  const all = [];
  (function walk(e) { all.push(e); e.childNodes.filter((n) => n.nodeType === 1).forEach(walk); })(body);
  const styles = new Map(all.map((e) => [e, e.o]));
  return {
    document: { body, documentElement: { nodeType: 1, o: {}, parentElement: null } },
    getComputedStyle: (e) => {
      const o = styles.get(e) ?? e.o ?? {};
      return {
        fontSize: o.fs ?? '15px', fontWeight: o.fw ?? '400', textTransform: o.tt ?? 'none',
        fontFamily: o.ff ?? 'system-ui', color: o.color ?? 'rgb(0, 0, 0)',
        backgroundColor: o.bg ?? 'rgba(0, 0, 0, 0)', display: o.display ?? 'block',
        visibility: o.visibility ?? 'visible', opacity: o.opacity ?? '1',
      };
    },
    window: { innerWidth: 400, innerHeight: 800 },
  };
}
const page = (items) => ({
  async evaluate(fn, arg) {
    const d = dom(items);
    const g = globalThis;
    const saved = [g.document, g.getComputedStyle, g.window];
    g.document = d.document; g.getComputedStyle = d.getComputedStyle; g.window = d.window;
    try { return fn(arg); } finally { [g.document, g.getComputedStyle, g.window] = saved; }
  },
});

const base = [
  { text: 'Chief', fs: '24px', fw: '700' },
  { text: 'Row title', fs: '17px', fw: '600' },
  { text: 'Description', fs: '15px', fw: '400' },
  { text: 'Meta', fs: '13px', fw: '400', color: 'rgb(90, 90, 90)' },
  { text: 'PROBLEMS', fs: '12px', fw: '600', tt: 'uppercase', color: 'rgb(90, 90, 90)' },
];

test('auditTextStyles returns styles under budget', async () => {
  const r = await auditTextStyles(page(base));
  assert.equal(r.styles.length, 5);
  assert.deepEqual(r.weights.map((w) => w.key).sort(), ['400', '600', '700']);
  assert.equal(r.colours.length, 2);
  assert.equal(r.styles.find((s) => s.key.startsWith('12px')).key, '12px|600|uppercase|sans');
});

test('auditTextStyles throws listing styles when over budget', async () => {
  const items = [...base, { text: 'Extra', fs: '14px', fw: '500', color: 'rgb(200, 0, 0)' }, { text: 'Code', fs: '15px', ff: 'ui-monospace, monospace', color: 'rgb(0, 0, 200)' }];
  await assert.rejects(() => auditTextStyles(page(items)), (e) => {
    assert.ok(e instanceof Error);
    assert.match(e.message, /7 text styles \(max 5\)/);
    assert.match(e.message, /14px\|500\|none\|sans ×1 "Extra"/);
    assert.match(e.message, /15px\|400\|none\|mono ×1 "Code"/);
    assert.match(e.message, /4 font weights \(max 3\)/);
    assert.match(e.message, /4 text colours \(max 3\)/);
    return true;
  });
  assert.equal((await auditTextStyles(page(items), { maxStyles: 9, maxWeights: 9, maxColours: 9 })).styles.length, 7);
});

test('auditTextStyles ignores selectors, filled chips, hidden and off-screen text', async () => {
  const items = [
    ...base,
    { text: '9', fs: '11px', fw: '700', cls: 'pnum', ff: 'monospace' },
    { tag: 'span', cls: 'wrap', children: [{ text: 'inside', fs: '10px', cls: 'tbadge' }] },
    { text: 'V5', fs: '12px', fw: '700', color: 'rgb(255, 255, 255)', bg: 'rgb(53, 122, 49)' },
    { bg: 'rgb(53, 122, 49)', children: [{ children: [{ text: 'deep', fs: '12px', fw: '700', color: 'rgb(255, 255, 255)' }] }] },
    { text: 'gone', fs: '30px', fw: '300', display: 'none', rect: { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 } },
    { text: 'below', fs: '31px', fw: '300', rect: { width: 50, height: 20, left: 10, top: 900, right: 60, bottom: 920 } },
    { text: 'clear', fs: '32px', fw: '300', opacity: '0' },
  ];
  const r = await auditTextStyles(page(items), { ignore: ['.pnum', '.tbadge'], maxStyles: 6 });
  assert.equal(r.styles.length, 6); // five roles + the chip text (12px bold sans)
  assert.equal(r.colours.length, 2); // chip text is not counted as white
  assert.ok(!r.colours.some((c) => c.key === 'rgb(255, 255, 255)'));
  assert.ok(!r.styles.some((s) => /^(10|11|30|31|32)px/.test(s.key)));
  await assert.rejects(() => auditTextStyles(page(items), { ignore: ['.pnum', '.tbadge'], maxStyles: 5 }), /6 text styles/);
});
