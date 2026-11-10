import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { build, baseTokens } from '../build/build.mjs';
import { loadRules, emitRuleDocs, TOPIC_PREFIX } from '../build/rules.mjs';
import { emitPluginRefs } from '../build/plugin.mjs';
import { sync } from '../sync/sync.mjs';
import { main } from '../bin/design-foundations.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const tmp = (p) => mkdtempSync(join(tmpdir(), p));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const SKILL = join(ROOT, 'plugin/skills/design-foundations');
const rules = loadRules(join(ROOT, 'rules'));
let dist;
let refs;
before(async () => {
  dist = tmp('df-sync-dist-');
  await build({ out: dist });
  refs = emitPluginRefs(rules, baseTokens());
});

const ls = (d) => readdirSync(d).sort();

test('sync copies dist and writes VERSION', async () => {
  const to = tmp('df-sync-to-');
  await sync({ to, version: '9.9.9', distDir: dist });
  for (const f of ls(dist)) assert.equal(readFileSync(join(to, f), 'utf8'), readFileSync(join(dist, f), 'utf8'), f);
  assert.ok(existsSync(join(to, 'motion.global.js')));
  assert.equal(readFileSync(join(to, 'VERSION'), 'utf8').trim(), '9.9.9');
  const manifest = JSON.parse(readFileSync(join(to, '.df-manifest.json'), 'utf8'));
  assert.ok(manifest.files.includes('tokens.css') && manifest.files.includes('VERSION'));
});

test('sync never deletes files it did not write; removes stale files from its own manifest', async () => {
  const to = tmp('df-sync-stale-');
  writeFileSync(join(to, 'mine.txt'), 'keep');
  mkdirSync(join(to, 'sub'));
  writeFileSync(join(to, 'sub/other.txt'), 'keep');
  const d1 = tmp('df-sync-d1-');
  writeFileSync(join(d1, 'a.css'), 'a');
  writeFileSync(join(d1, 'old.js'), 'old');
  await sync({ to, version: '1', distDir: d1 });
  assert.ok(existsSync(join(to, 'old.js')));
  const d2 = tmp('df-sync-d2-');
  writeFileSync(join(d2, 'a.css'), 'a2');
  await sync({ to, version: '2', distDir: d2 });
  assert.ok(!existsSync(join(to, 'old.js')), 'stale file we wrote is removed');
  assert.equal(readFileSync(join(to, 'a.css'), 'utf8'), 'a2');
  assert.equal(readFileSync(join(to, 'mine.txt'), 'utf8'), 'keep');
  assert.equal(readFileSync(join(to, 'sub/other.txt'), 'utf8'), 'keep');
  assert.equal(readFileSync(join(to, 'VERSION'), 'utf8').trim(), '2');
});

test('sync ignores manifest entries that escape the target directory', async () => {
  const base = tmp('df-sync-esc-');
  const to = join(base, 'to');
  mkdirSync(to);
  writeFileSync(join(base, 'victim.txt'), 'safe');
  writeFileSync(join(to, '.df-manifest.json'), JSON.stringify({ version: '0', files: ['../victim.txt', '/etc/hostname'] }));
  const d = tmp('df-sync-d-');
  writeFileSync(join(d, 'a.css'), 'a');
  await sync({ to, version: '1', distDir: d });
  assert.equal(readFileSync(join(base, 'victim.txt'), 'utf8'), 'safe');
});

test('sync with --skill copies SKILL.md and references', async () => {
  const to = tmp('df-sync-to-');
  const skill = tmp('df-sync-skill-');
  await sync({ to, skill, version: '1.0.0', distDir: dist });
  const root = join(skill, 'design-foundations');
  assert.equal(readFileSync(join(root, 'SKILL.md'), 'utf8'), readFileSync(join(SKILL, 'SKILL.md'), 'utf8'));
  assert.ok(existsSync(join(root, 'references/motion.md')));
  assert.ok(existsSync(join(root, 'references/tokens.md')));
});

test('CLI: sync --to/--skill works, missing --to exits 2', async () => {
  const to = tmp('df-cli-to-');
  const skill = tmp('df-cli-skill-');
  assert.equal(await main(['sync', '--to', to, '--skill', skill]), 0);
  assert.equal(readFileSync(join(to, 'VERSION'), 'utf8').trim(), pkg.version);
  assert.ok(existsSync(join(to, 'motion.global.js')));
  assert.ok(existsSync(join(skill, 'design-foundations/SKILL.md')));
  assert.equal(await main(['sync']), 2);
  assert.equal(await main(['sync', '--to']), 2);
});

test('generated references contain every rule id', () => {
  for (const topic of Object.keys(TOPIC_PREFIX)) {
    const text = refs[`plugin/skills/design-foundations/references/${topic}.md`];
    assert.ok(text, topic);
    assert.match(text, /^<!-- generated .*do not edit/);
    for (const r of rules.filter((x) => x.topic === topic)) assert.ok(text.includes(`${r.id} — `), r.id);
  }
  assert.equal(Object.keys(refs).length, 16);
});

test('reference lines read "ID — rule — web", grouped must, should, consider', () => {
  const text = refs['plugin/skills/design-foundations/references/motion.md'];
  const r = rules.find((x) => x.id === 'MOT-02');
  const one = (s) => s.replace(/\s+/g, ' ').trim();
  assert.ok(text.includes(`${r.id} — ${one(r.rule)} — ${one(r.web)}`));
  const at = (h) => text.indexOf(`## ${h}`);
  assert.ok(at('Must') > 0 && at('Must') < at('Should') && at('Should') < at('Consider'));
  assert.ok(text.indexOf('MOT-02 — ') > at('Must') && text.indexOf('MOT-02 — ') < at('Should'));
});

test('angle brackets in prose are escaped, code spans untouched', () => {
  const r = { id: 'MOT-99', topic: 'motion', severity: 'should', rule: 'Use <role> tokens, not `<b>`.', why: 'a > b', web: 'Write <div> sparingly.', source: { topic: 'motion', anchor: 'x', via: 'hig' }, platforms: ['web'] };
  const ref = emitPluginRefs([r], baseTokens())['plugin/skills/design-foundations/references/motion.md'];
  assert.ok(ref.includes('Use &lt;role&gt; tokens, not `<b>`.'));
  assert.ok(ref.includes('Write &lt;div&gt; sparingly.'));
  const doc = emitRuleDocs([r])['docs/rules/motion.md'];
  assert.ok(doc.includes('Use &lt;role&gt; tokens, not `<b>`.'));
  assert.ok(doc.includes('a &gt; b'));
  assert.ok(doc.startsWith('<!-- generated'), 'header comment stays raw');
});

test('tokens.md lists every --df var with value, Tailwind keys and motion exports', async () => {
  const text = refs['plugin/skills/design-foundations/references/tokens.md'];
  assert.match(text, /^<!-- generated .*do not edit/);
  const css = readFileSync(join(dist, 'tokens.css'), 'utf8');
  const first = new Map();
  for (const m of css.matchAll(/^\s*(--df-[\w-]+):\s*(.+?);\s*$/gm)) if (!first.has(m[1])) first.set(m[1], m[2]);
  assert.ok(first.size > 100);
  for (const [name, value] of first) assert.ok(text.includes(`${name}: ${value}`), name);
  const preset = createRequire(import.meta.url)(join(dist, 'tailwind-preset.cjs'));
  for (const [section, entries] of Object.entries(preset.theme.extend)) {
    assert.ok(text.includes(section), section);
    for (const key of Object.keys(entries)) assert.ok(text.includes(key), `${section}.${key}`);
  }
  const m = await import(join(dist, 'motion.js'));
  for (const name of Object.keys(m)) assert.ok(text.includes(name), name);
  assert.ok(text.includes('DFMotion') && text.includes('motion.global.js'));
  assert.ok(text.includes('--df-color-bg-primary'));
  assert.doesNotMatch(text.replace(/`[^`]*`/g, ''), /<role>/); // only inside code spans
});

test('committed plugin references are in sync with rules and tokens', () => {
  for (const [rel, text] of Object.entries(refs)) assert.equal(readFileSync(join(ROOT, rel), 'utf8'), text, rel);
  for (const [rel, text] of Object.entries(emitRuleDocs(rules))) assert.equal(readFileSync(join(ROOT, rel), 'utf8'), text, rel);
});

test('marketplace.json, plugin.json and SKILL.md have the agreed shapes', () => {
  const mk = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(mk.name, 'design-foundations');
  assert.deepEqual(mk.owner, { name: 'Aidan Philpott' });
  assert.equal(mk.plugins.length, 1);
  assert.equal(mk.plugins[0].name, 'design-foundations');
  assert.equal(mk.plugins[0].source, './plugin');
  assert.ok(mk.plugins[0].description);
  const pl = JSON.parse(readFileSync(join(ROOT, 'plugin/.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(pl.name, 'design-foundations');
  assert.equal(pl.version, pkg.version);
  assert.ok(pl.description);
  const skill = readFileSync(join(SKILL, 'SKILL.md'), 'utf8');
  assert.match(skill, /^---\nname: design-foundations\ndescription: .+\n---\n/);
  assert.ok(skill.split('\n').length <= 125);
  assert.match(skill, /df-allow/);
  assert.match(skill, /npx github:AidanPhilpott\/design-foundations#v\S* check/);
  assert.match(skill, /npx design-foundations check/);
  assert.match(skill, /check --format json/);
  for (const id of ['WRT', 'BRD', 'INC', 'PRV', 'LAY']) assert.match(skill, new RegExp(id));
  assert.match(skill, /references\/tokens\.md/);
});
