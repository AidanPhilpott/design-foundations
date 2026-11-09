import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { registerCheck, getChecks, checkIds } from '../check/index.mjs';
import { matchGlob } from '../check/glob.mjs';
import { scanCss, scanSources, scanInlineStyle } from '../check/scan.mjs';
import { loadConfig, ConfigError, fingerprint, applyBaseline, evaluate } from '../check/core.mjs';
import { runCheckCli } from '../check/cli.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, 'fixtures');
const BIN = resolve(HERE, '..', 'bin', 'design-foundations.mjs');

let seenCtx = null;
// Dummy check: flags every `transition` declaration. Real checks arrive in tasks 9-11.
registerCheck({
  id: 'raw-values',
  ruleIds: ['MOT-TEST'],
  run(ctx) {
    seenCtx = ctx;
    const out = [];
    for (const f of ctx.files) {
      if (f.kind !== 'css') continue;
      for (const d of scanCss(f.text)) {
        if (d.prop === 'transition') {
          out.push({ check: 'raw-values', ruleIds: ['MOT-TEST'], file: f.path, line: d.line, snippet: `${d.prop}: ${d.value}`, message: 'literal transition' });
        }
      }
    }
    return out;
  },
});

function project(files, config = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'df-check-'));
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
  const cfg = { include: ['**/*.css'], checks: { 'raw-values': 'error' }, ...config };
  cfg.checks = { 'reduced-motion': 'off', ...cfg.checks }; // these tests drive the dummy raw-values check only
  writeFileSync(join(dir, 'design-foundations.config.json'), JSON.stringify(cfg));
  return { dir, cfg: join(dir, 'design-foundations.config.json') };
}
const css2 = '.a { transition: all .2s; }\n.b { transition: all .2s; }\n';

function baselineFrom(res) {
  return { version: 1, fingerprints: Object.fromEntries(res.fresh.map((f) => [f.fingerprint, { check: f.check, file: f.file, snippet: f.snippet }])) };
}

test('registry: register, list, ids; re-registering an id replaces it', () => {
  assert.ok(checkIds().includes('raw-values'));
  const n = getChecks().length;
  const orig = getChecks().find((c) => c.id === 'raw-values');
  registerCheck({ id: 'raw-values', ruleIds: [], run: () => [] });
  assert.equal(getChecks().length, n);
  assert.deepEqual(getChecks().find((c) => c.id === 'raw-values').ruleIds, []);
  registerCheck(orig);
});

test('glob: **, *, ?, braces, zero-dir ** and dotfiles', () => {
  assert.ok(matchGlob('app/**/*.{css,js}', 'app/a.css'));
  assert.ok(matchGlob('app/**/*.{css,js}', 'app/x/y/a.js'));
  assert.ok(!matchGlob('app/**/*.{css,js}', 'app/a.html'));
  assert.ok(!matchGlob('app/*.css', 'app/x/a.css'));
  assert.ok(matchGlob('app/?.css', 'app/a.css'));
  assert.ok(!matchGlob('app/?.css', 'app/ab.css'));
  assert.ok(matchGlob('app/vendor/**', 'app/vendor/deep/x.css'));
  assert.ok(matchGlob('./app/*.css', 'app/a.css'));
});

test('loadConfig: reads fixture, resolves relative to config dir', () => {
  const cfg = loadConfig(join(FIX, 'project-basic', 'design-foundations.config.json'));
  assert.equal(cfg.dir, join(FIX, 'project-basic'));
  assert.deepEqual(cfg.tokenFiles, ['app/tokens.css']);
  assert.equal(cfg.baseline, 'design-foundations.baseline.json');
  assert.deepEqual(cfg.motionCalls, []);
});

test('unknown check in config exits 2', () => {
  assert.throws(() => loadConfig(join(FIX, 'project-bad-check', 'design-foundations.config.json')), ConfigError);
  assert.throws(() => loadConfig(join(FIX, 'project-bad-severity', 'design-foundations.config.json')), /severity/);
  const r = spawnSync(process.execPath, [BIN, 'check', '--config', join(FIX, 'project-bad-check', 'design-foundations.config.json')], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /nope/);
  const missing = spawnSync(process.execPath, [BIN, 'check', '--config', join(FIX, 'no-such.json')], { encoding: 'utf8' });
  assert.equal(missing.status, 2);
});

test('planned check ids (no module yet) are valid config', () => {
  const { cfg } = project({ 'a.css': '' }, { checks: { contrast: 'error', icons: 'warn', focus: 'off' } });
  assert.doesNotThrow(() => loadConfig(cfg));
});

test('unknown top-level config key is rejected', () => {
  const { cfg } = project({ 'a.css': '' }, { inlcude: ['x'] });
  assert.throws(() => loadConfig(cfg), /inlcude/);
});

test('scanCss ignores comments and strings and reports correct lines with CRLF', () => {
  const css = '/* a { transition: x 1s; }\r\n   multi */\r\n.a {\r\n  content: "} transition: 2s;";\r\n  color: red; /* c: 1s */\r\n  transition: all .2s\r\n}\r\n';
  const d = scanCss(css);
  assert.deepEqual(d.map((x) => [x.prop, x.line]), [['content', 4], ['color', 5], ['transition', 6]]);
  assert.equal(d[0].value, '" "'); // string contents blanked (whitespace then collapsed)
  assert.ok(!d[0].value.includes('transition'));
  assert.equal(d[2].value, 'all .2s');
  assert.equal(d[2].selector, '.a');
  assert.deepEqual(d[2].atRules, []);
});

test('scanCss: nested @media/@supports report atRules and selectors; semicolons in url() survive', () => {
  const css = '@media (min-width: 600px) {\n  @supports (display: grid) {\n    .g,\n    .h > i { display: grid; background: url(data:image/png;base64,AAA) }\n  }\n}\n@keyframes spin { from { opacity: 0 } to { opacity: 1 } }\n.z { top: 0 }\n';
  const d = scanCss(css);
  const g = d.find((x) => x.prop === 'display');
  assert.equal(g.line, 4);
  assert.equal(g.selector, '.g,\n    .h > i');
  assert.deepEqual(g.atRules, ['@media (min-width: 600px)', '@supports (display: grid)']);
  assert.ok(d.find((x) => x.prop === 'background').value.startsWith('url(data:image/png;base64,AAA'));
  const k = d.filter((x) => x.atRules[0]?.startsWith('@keyframes'));
  assert.deepEqual(k.map((x) => [x.selector, x.value]), [['from', '0'], ['to', '1']]);
  assert.deepEqual(d.at(-1).atRules, []);
});

test('scanCss: positions are preserved when stripping', () => {
  const css = 'a{color:/*x*/red;b:"yy"}';
  const d = scanCss(css);
  assert.deepEqual(d.map((x) => [x.prop, x.value]), [['color', 'red'], ['b', '" "']]);
});

test('scanSources html: style attr, class, <style> block with start line', () => {
  const html = '<!-- <i class="skip"> -->\n<div class="a b"\n style="color: red">\n<style>\n.x { color: blue }\n</style>';
  const s = scanSources(html, 'html');
  assert.deepEqual(s.find((x) => x.kind === 'class'), { kind: 'class', value: 'a b', line: 2 });
  assert.deepEqual(s.find((x) => x.kind === 'style'), { kind: 'style', value: 'color: red', line: 3 });
  const blk = s.find((x) => x.kind === 'css-block');
  assert.equal(blk.line, 4);
  assert.equal(scanCss(blk.value).find((d) => d.prop === 'color').line + blk.line - 1, 5);
  assert.ok(!s.some((x) => x.value === 'skip'));
});

test('scanSources js: style={{}}, className, template strings, call sites', () => {
  const js = [
    'const a = <div style={{ color: "red", transition: "all .2s" }} className="p-4 duration-[200ms]" />;',
    '// map.flyTo(x) in a comment',
    'const b = <p className={`m-2 ${x}`}>hi</p>;',
    'map.flyTo([1, 2], 12);',
    'if (ok) { scrollTo(0, 0); }',
    'el.innerHTML = `<i class="q" style="top:1px"></i>`;',
  ].join('\n');
  const s = scanSources(js, 'js');
  const style = s.filter((x) => x.kind === 'style');
  assert.equal(style[0].line, 1);
  assert.match(style[0].value, /transition: "all \.2s"/);
  assert.equal(style[1].value, 'top:1px');
  assert.deepEqual(s.filter((x) => x.kind === 'class').map((x) => [x.value, x.line]), [['p-4 duration-[200ms]', 1], ['m-2 ${x}', 3], ['q', 6]]);
  const calls = s.filter((x) => x.kind === 'call');
  assert.deepEqual(calls.filter((c) => ['flyTo', 'scrollTo'].includes(c.name)).map((c) => [c.value, c.name, c.line]), [['map.flyTo', 'flyTo', 4], ['scrollTo', 'scrollTo', 5]]);
  assert.ok(!calls.some((c) => c.line === 2));
  assert.ok(!calls.some((c) => c.name === 'if'));
  assert.equal(calls.find((c) => c.name === 'flyTo').args, '[1, 2], 12');
  assert.deepEqual(scanSources(js, 'js', { calls: ['scrollTo'] }).filter((x) => x.kind === 'call').map((c) => c.name), ['scrollTo']);
});

test('scanInlineStyle parses a style attribute value with line offset', () => {
  const d = scanInlineStyle('color: red;\n transition: all 1s', 7);
  assert.deepEqual(d.map((x) => [x.prop, x.line]), [['color', 7], ['transition', 8]]);
});

test('fingerprint is stable across whitespace in the snippet, differs by occurrence', () => {
  const f = { check: 'raw-values', file: 'a.css', snippet: 'transition:  all  .2s' };
  const g = { ...f, snippet: 'transition: all .2s' };
  assert.equal(fingerprint(f, 0), fingerprint(g, 0));
  assert.notEqual(fingerprint(f, 0), fingerprint(f, 1));
  assert.match(fingerprint(f, 0), /^[0-9a-f]{40}$/);
});

test('context: files read once with relative forward-slash paths and kinds; exclude and unknown kinds dropped', () => {
  const { cfg } = project({ 'app/a.css': css2, 'app/sub/p.html': '<p></p>', 'app/x.js': '', 'app/readme.md': '', 'app/vendor/v.css': css2 }, { include: ['app/**/*'], exclude: ['app/vendor/**'] });
  evaluate(cfg);
  const files = seenCtx.files.map((f) => [f.path, f.kind]).sort();
  assert.deepEqual(files, [['app/a.css', 'css'], ['app/sub/p.html', 'html'], ['app/x.js', 'js']]);
  assert.ok(seenCtx.tokens instanceof Map && seenCtx.tokens.size > 0);
  assert.equal(seenCtx.projectRoles, null);
  assert.equal(seenCtx.config.dir !== undefined, true);
});

test('ctx.projectRoles is the parsed project colour file when projectTokens is set', () => {
  const { dir, cfg } = project({ 'a.css': '', 'p.json': '{"roles":{"bg":{"light":"#fff"}}}' }, { projectTokens: 'p.json' });
  evaluate(cfg);
  assert.deepEqual(seenCtx.projectRoles, { roles: { bg: { light: '#fff' } } });
  writeFileSync(join(dir, 'p.json'), '{nope');
  assert.throws(() => evaluate(cfg), ConfigError);
});

test('duplicate snippets get distinct fingerprints', () => {
  const { cfg } = project({ 'a.css': css2 });
  const r = evaluate(cfg);
  assert.equal(r.fresh.length, 2);
  assert.notEqual(r.fresh[0].fingerprint, r.fresh[1].fingerprint);
});

test('fixing one of two keeps the other known', () => {
  const { dir, cfg } = project({ 'a.css': css2 });
  const base = baselineFrom(evaluate(cfg));
  writeFileSync(join(dir, 'a.css'), '.a { color: red; }\n.b { transition: all .2s; }\n');
  const r = evaluate(cfg, { baseline: base });
  assert.equal(r.fresh.length, 0);
  assert.equal(r.known.length, 1);
});

test('a third identical one is fresh', () => {
  const { dir, cfg } = project({ 'a.css': css2 });
  const base = baselineFrom(evaluate(cfg));
  writeFileSync(join(dir, 'a.css'), css2 + '.c { transition: all .2s; }\n');
  const r = evaluate(cfg, { baseline: base });
  assert.equal(r.known.length, 2);
  assert.equal(r.fresh.length, 1);
  assert.equal(r.fresh[0].line, 3);
});

test('fingerprint survives inserting lines above', () => {
  const { dir, cfg } = project({ 'a.css': css2 });
  const base = baselineFrom(evaluate(cfg));
  writeFileSync(join(dir, 'a.css'), '/* one */\n/* two */\n.z { color: red; }\n' + css2);
  const r = evaluate(cfg, { baseline: base });
  assert.equal(r.fresh.length, 0);
  assert.equal(r.known.length, 2);
  assert.equal(r.known[0].line, 4);
});

test('applyBaseline splits by fingerprint', () => {
  const fs = [{ check: 'c', file: 'f', snippet: 's', fingerprint: 'aa' }, { check: 'c', file: 'f', snippet: 't', fingerprint: 'bb' }];
  const r = applyBaseline(fs, { version: 1, fingerprints: { aa: {} } });
  assert.deepEqual(r.known.map((x) => x.fingerprint), ['aa']);
  assert.deepEqual(r.fresh.map((x) => x.fingerprint), ['bb']);
});

test('df-allow suppresses (same or preceding line) and is counted', () => {
  const css = [
    '.a { transition: all .2s; } /* df-allow raw-values: legacy */',
    '/* df-allow raw-values: vendor shim */',
    '.b { transition: all .2s; }',
    '/* df-allow contrast: wrong check */',
    '.c { transition: all .2s; }',
    '.d { transition: all .2s; }',
  ].join('\n');
  const { cfg } = project({ 'a.css': css });
  const r = evaluate(cfg);
  assert.equal(r.suppressed.length, 2);
  assert.deepEqual(r.fresh.map((f) => f.line), [5, 6]);
  const io = { out: [], err: [] };
  const code = runCheckCli(['--config', cfg], { out: (s) => io.out.push(s), err: (s) => io.err.push(s) });
  assert.equal(code, 1);
  assert.match(io.out.join('\n'), /2 new, 0 known \(baselined\), 2 suppressed/);
});

test('severity: warn never fails, off does not run, config severity overrides', () => {
  const { cfg } = project({ 'a.css': css2 }, { checks: { 'raw-values': 'warn' } });
  const r = evaluate(cfg);
  assert.equal(r.fresh[0].severity, 'warn');
  assert.equal(runCheckCli(['--config', cfg], { out() {}, err() {} }), 0);
  const off = project({ 'a.css': css2 }, { checks: { 'raw-values': 'off' } });
  assert.equal(evaluate(off.cfg).fresh.length, 0);
  const unset = project({ 'a.css': css2 }, { checks: {} });
  assert.equal(evaluate(unset.cfg).fresh[0].severity, 'warn');
});

test('--update-baseline then check exits 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'df-fix-'));
  cpSync(join(FIX, 'project-basic'), dir, { recursive: true });
  const cfg = join(dir, 'design-foundations.config.json');
  const quiet = { out() {}, err() {} };
  assert.equal(runCheckCli(['--config', cfg], quiet), 1);
  assert.equal(runCheckCli(['--config', cfg, '--update-baseline'], quiet), 0);
  const bl = JSON.parse(readFileSync(join(dir, 'design-foundations.baseline.json'), 'utf8'));
  assert.equal(bl.version, 1);
  assert.equal(Object.keys(bl.fingerprints).length, 2);
  const io = [];
  assert.equal(runCheckCli(['--config', cfg], { out: (s) => io.push(s), err() {} }), 0);
  assert.match(io.join('\n'), /0 new, 2 known \(baselined\), 0 suppressed/);
  rmSync(dir, { recursive: true });
});

test('output formats: text lines and json shape', () => {
  const { cfg } = project({ 'a.css': css2 });
  const t = [];
  runCheckCli(['--config', cfg], { out: (s) => t.push(s), err() {} });
  assert.match(t[0], /^a\.css:1 {2}raw-values {2}\[MOT-TEST\] {2}literal transition$/);
  const j = [];
  runCheckCli(['--config', cfg, '--format', 'json'], { out: (s) => j.push(s), err() {} });
  const o = JSON.parse(j.join('\n'));
  assert.deepEqual(Object.keys(o).sort(), ['counts', 'fresh', 'known', 'suppressed']);
  assert.deepEqual(o.counts, { fresh: 2, known: 0, suppressed: 0 });
  assert.ok(o.fresh[0].fingerprint);
});

test('bad usage exits 2', () => {
  const q = { out() {}, err() {} };
  assert.equal(runCheckCli(['--format', 'xml'], q), 2);
  assert.equal(runCheckCli(['--bogus'], q), 2);
});

test('scanCss flushes a final unterminated declaration at end of file', () => {
  const ds = scanCss('.a { color: red; transition: all .2s');
  assert.deepEqual(ds.map((d) => [d.prop, d.value]), [['color', 'red'], ['transition', 'all .2s']]);
  assert.deepEqual(scanInlineStyle('color: red; margin: 0').map((d) => d.prop), ['color', 'margin']);
});

test('scanCss: an unbalanced ( does not swallow the rest of the file', () => {
  const ds = scanCss('.a { width: calc(1px + 2px; color: red; }\n.b { transition: all .2s; }\n');
  assert.ok(ds.some((d) => d.prop === 'transition' && d.selector === '.b' && d.line === 2), JSON.stringify(ds));
});

test('df-allow on the preceding line only counts when that line holds nothing but the comment', () => {
  const css = [
    '.a { color: red; } /* df-allow raw-values: belongs to line 1 only */',
    '.b { transition: all .2s; }',
    '/* df-allow raw-values: standalone */',
    '.c { transition: all .2s; }',
  ].join('\n');
  const { cfg } = project({ 'a.css': css });
  const r = evaluate(cfg);
  assert.deepEqual(r.fresh.map((f) => f.line), [2]);
  assert.equal(r.suppressed.length, 1);
});

test('a finding-level severity overrides the check severity; targetSelectors is an accepted config key', () => {
  registerCheck({ id: 'sev-probe', ruleIds: [], run: (ctx) => (ctx.config.checks['sev-probe'] ? [{ file: 'x.css', line: 1, snippet: 'a', message: 'm', severity: 'error' }, { file: 'x.css', line: 1, snippet: 'b', message: 'm' }] : []) });
  const dir = mkdtempSync(join(tmpdir(), 'df-sev-'));
  writeFileSync(join(dir, 'x.css'), 'a{}');
  writeFileSync(join(dir, 'c.json'), JSON.stringify({ checks: { 'sev-probe': 'warn' }, targetSelectors: ['.chip'] }));
  const r = evaluate(join(dir, 'c.json'));
  const f = r.findings.filter((x) => x.check === 'sev-probe');
  assert.deepEqual(f.map((x) => [x.snippet, x.severity]), [['a', 'error'], ['b', 'warn']]);
  assert.deepEqual(r.config.targetSelectors, ['.chip']);
});
