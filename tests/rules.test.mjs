import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadRules, validateRules, emitRuleDocs, ruleContext } from '../build/rules.mjs';
import { build } from '../build/build.mjs';

const RULES_DIR = new URL('../rules/', import.meta.url).pathname;

const rule = (over = {}) => ({
  id: 'MOT-01',
  topic: 'motion',
  rule: 'Animate only when it helps.',
  why: 'Extra motion distracts.',
  source: { topic: 'motion', anchor: 'Best practices', via: 'hig' },
  platforms: ['web', 'swift'],
  web: 'Applies to CSS transitions.',
  severity: 'should',
  ...over,
});
const ctx = { checkIds: new Set(['reduced-motion', 'raw-values']), tokenPaths: new Set(['motion.duration.micro']) };

function tmpRules(files) {
  const dir = mkdtempSync(join(tmpdir(), 'df-rules-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

test('a valid rule passes', () => {
  assert.deepEqual(validateRules([rule()], ctx), []);
});

test('duplicate id fails', () => {
  const errs = validateRules([rule(), rule()], ctx);
  assert.ok(errs.some((e) => /duplicate id MOT-01/.test(e)), errs.join('\n'));
});

test('MOT id in color.yaml fails', () => {
  const dir = tmpRules({
    'color.yaml': `- id: MOT-01
  rule: Use roles.
  why: Themes change.
  source: {topic: color, anchor: Best practices, via: hig}
  platforms: [web]
  web: Use CSS variables.
  severity: must
`,
  });
  const rules = loadRules(dir);
  assert.equal(rules[0].topic, 'color');
  const errs = validateRules(rules, ctx);
  assert.ok(errs.some((e) => /MOT-01.*prefix COL/.test(e)), errs.join('\n'));
});

test('unknown check fails', () => {
  const errs = validateRules([rule({ check: 'nope' })], ctx);
  assert.ok(errs.some((e) => /MOT-01: unknown check "nope"/.test(e)), errs.join('\n'));
});

test('unknown token, bad via and missing fields fail', () => {
  const errs = validateRules([rule({ tokens: ['motion.duration.nope'], source: { topic: 'motion', anchor: 'x', via: 'blog' }, why: undefined })], ctx);
  assert.ok(errs.some((e) => /unknown token "motion\.duration\.nope"/.test(e)), errs.join('\n'));
  assert.ok(errs.some((e) => /source\.via "blog"/.test(e)), errs.join('\n'));
  assert.ok(errs.some((e) => /missing "why"/.test(e)), errs.join('\n'));
  assert.ok(validateRules([rule({ source: undefined })], ctx).some((e) => /missing "source"/.test(e)));
});

test('check ruleIds must exist only for topics whose yaml exists', () => {
  const checkRuleIds = new Map([['reduced-motion', ['MOT-05']], ['raw-values', ['MOT-01', 'COL-02']]]);
  const errs = validateRules([rule()], { ...ctx, checkRuleIds });
  assert.ok(errs.some((e) => /reduced-motion.*MOT-05/.test(e)), errs.join('\n'));
  assert.ok(!errs.some((e) => /COL-02/.test(e)), 'color.yaml absent: COL ids are not required yet');
});

test('unknown keys and non-object entries fail', () => {
  const errs = validateRules([rule({ sevrity: 'must' }), rule({ id: 'MOT-02', source: { topic: 'motion', anchor: 'x', via: 'hig', ancor: 'y' } })], ctx);
  assert.ok(errs.some((e) => /MOT-01: unknown key "sevrity"/.test(e)), errs.join('\n'));
  assert.ok(errs.some((e) => /MOT-02: unknown key "source\.ancor"/.test(e)), errs.join('\n'));
  const dir = tmpRules({ 'motion.yaml': '- just a string\n' });
  assert.ok(validateRules(loadRules(dir), ctx).some((e) => /must be a mapping/.test(e)));
});

test('via: house is accepted and rendered as a house rule', () => {
  const r = rule({ source: { topic: 'motion', anchor: 'Best practices', via: 'house' } });
  assert.deepEqual(validateRules([r], ctx), []);
  const md = emitRuleDocs([r])['docs/rules/motion.md'];
  assert.match(md, /Source: house rule/);
  assert.match(emitRuleDocs([rule()])['docs/rules/motion.md'], /Source: \[HIG › Motion › Best practices\]/);
});

test('motion.yaml validates', async () => {
  const rules = loadRules(RULES_DIR).filter((r) => r.topic === 'motion');
  assert.equal(rules.length, 14);
  assert.deepEqual(validateRules(rules, await ruleContext()), []);
  const byId = Object.fromEntries(rules.map((r) => [r.id, r]));
  for (const id of ['MOT-05', 'MOT-08', 'MOT-09', 'MOT-10']) assert.equal(byId[id].check, 'reduced-motion');
  assert.equal(byId['MOT-11'].check, 'raw-values');
  for (const id of ['MOT-09', 'MOT-10', 'MOT-11', 'MOT-12']) assert.equal(byId[id].source.via, 'house', id);
  assert.equal(byId['MOT-08'].source.via, 'wcag');
  assert.equal(byId['MOT-13'].source.via, 'wcag');
  assert.equal(byId['MOT-13'].severity, 'must');
});

test('index.md lists every id', () => {
  const rules = loadRules(RULES_DIR);
  const docs = emitRuleDocs(rules);
  const index = docs['docs/rules/index.md'];
  assert.match(index, /^<!-- generated .*do not edit/);
  for (const r of rules) assert.match(index, new RegExp(`\\b${r.id}\\b`));
  const motion = docs['docs/rules/motion.md'];
  assert.match(motion, /^<!-- generated .*do not edit/);
  assert.match(motion, /https:\/\/developer\.apple\.com\/design\/human-interface-guidelines\/motion/);
  for (const r of rules.filter((x) => x.topic === 'motion')) assert.ok(motion.includes(r.rule), r.id);
});

test('build writes rule docs and fails on invalid rules', async () => {
  const out = mkdtempSync(join(tmpdir(), 'df-build-rules-'));
  await build({ out: join(out, 'dist'), docsRoot: out });
  assert.ok(existsSync(join(out, 'docs/rules/index.md')));
  assert.match(readFileSync(join(out, 'docs/rules/motion.md'), 'utf8'), /MOT-14/);
  const none = mkdtempSync(join(tmpdir(), 'df-build-nodocs-'));
  await build({ out: join(none, 'dist') });
  assert.ok(!existsSync(join(none, 'docs')), 'no docsRoot: no docs written');
  const bad = tmpRules({ 'motion.yaml': '- id: MOT-01\n  rule: x\n' });
  await assert.rejects(build({ out: join(out, 'dist2'), docsRoot: out, rulesDir: bad }), /missing "why"/);
});

test('committed docs/rules match the generator (run `design-foundations build`)', () => {
  for (const [rel, text] of Object.entries(emitRuleDocs(loadRules(RULES_DIR)))) {
    const path = new URL(`../${rel}`, import.meta.url);
    assert.ok(existsSync(path), `${rel} missing`);
    assert.equal(readFileSync(path, 'utf8'), text, `${rel} is stale`);
  }
});
