import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPICS, hig2md, pageMeta } from '../ingest/hig.mjs';
import { fetchAll } from '../ingest/fetch.mjs';
import { diffManifest, runDiff } from '../ingest/diff.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = () => JSON.parse(fs.readFileSync(path.join(here, 'fixtures/hig/motion.json'), 'utf8'));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'df-ingest-'));

test('TOPICS lists the 15 topics in order', () => {
  assert.equal(TOPICS.length, 15);
  assert.equal(TOPICS[0], 'accessibility');
  assert.equal(TOPICS[14], 'writing');
});

test('hig2md renders headings, lists, tables and reference titles', () => {
  const md = hig2md(fixture());
  assert.match(md, /^# Sample Motion/);
  assert.match(md, /## Best practices/);
  assert.match(md, /Keep it short and use `ease-out`\. See Sample Reference and more\./);
  assert.match(md, /- First sample point\n- Second sample point/);
  assert.match(md, /1\. Step A/);
  assert.match(md, /> Note: Sample aside text/);
  assert.match(md, /\| Date \| Changes \|\n\| --- \| --- \|\n\| September 9, 2025 \| Sample newest entry\. \|/);
  assert.ok(!md.includes('pic.png'));
});

test('pageMeta reads latest change-log date', () => {
  const doc = fixture();
  const a = pageMeta(doc);
  const b = pageMeta(doc);
  assert.equal(a.title, 'Sample Motion');
  assert.equal(a.changelogLatest, 'September 9, 2025');
  assert.equal(a.contentHash, b.contentHash);
  const changed = fixture();
  changed.primaryContentSections[0].content[1].inlineContent[0].text = 'Keep it very ';
  assert.notEqual(pageMeta(changed).contentHash, a.contentHash);
});

test('pageMeta throws when the page has no usable shape', () => {
  assert.throws(() => pageMeta({}));
});

test('fetchAll keeps old cache on failure', async () => {
  const cacheDir = tmp();
  fs.writeFileSync(path.join(cacheDir, 'motion.md'), 'old');
  fs.writeFileSync(path.join(cacheDir, 'motion.json'), '{"old":true}');
  const fetchImpl = async (url) => {
    if (url.endsWith('/motion.json')) return new Response('nope', { status: 500 });
    if (url.endsWith('/color.json')) return new Response('{not json', { status: 200 });
    return new Response(JSON.stringify(fixture()), { status: 200 });
  };
  const res = await fetchAll({ topics: ['motion', 'color', 'layout'], cacheDir, fetchImpl });
  assert.deepEqual(res.ok, ['layout']);
  assert.deepEqual(res.failed.map((f) => f.topic).sort(), ['color', 'motion']);
  assert.equal(fs.readFileSync(path.join(cacheDir, 'motion.md'), 'utf8'), 'old');
  assert.equal(fs.readFileSync(path.join(cacheDir, 'motion.json'), 'utf8'), '{"old":true}');
  assert.ok(!fs.existsSync(path.join(cacheDir, 'color.json')));
  assert.ok(fs.existsSync(path.join(cacheDir, 'layout.md')));
  assert.deepEqual(fs.readdirSync(cacheDir).filter((f) => f.endsWith('.tmp')), []);
});

test('fetchAll rejects a page whose shape pageMeta cannot read', async () => {
  const cacheDir = tmp();
  const fetchImpl = async () => new Response('{"unexpected":1}', { status: 200 });
  const res = await fetchAll({ topics: ['motion'], cacheDir, fetchImpl });
  assert.equal(res.failed.length, 1);
  assert.ok(!fs.existsSync(path.join(cacheDir, 'motion.json')));
});

test('diffManifest lists changed topics with citing rule IDs', () => {
  const meta = (h) => ({ url: 'u', title: 't', changelogLatest: 'd', contentHash: h, fetchedAt: 'x' });
  const manifest = { motion: meta('A'), color: meta('C') };
  const metas = { motion: meta('B'), color: meta('C'), layout: meta('L') };
  const { changed } = diffManifest(manifest, metas, { motion: ['MOT-01'] });
  assert.deepEqual(changed.map((c) => c.topic), ['motion', 'layout']);
  assert.deepEqual(changed[0].ruleIds, ['MOT-01']);
  assert.equal(changed[0].from.contentHash, 'A');
  assert.equal(changed[0].to.contentHash, 'B');
  assert.equal(changed[1].from, null);
  assert.deepEqual(changed[1].ruleIds, []);
});

test('diff --accept refuses when a topic failed', async () => {
  const root = tmp();
  const cacheDir = path.join(root, 'cache');
  fs.mkdirSync(cacheDir);
  fs.writeFileSync(path.join(cacheDir, 'motion.json'), JSON.stringify(fixture()));
  fs.writeFileSync(
    path.join(cacheDir, '_last-fetch.json'),
    JSON.stringify({ fetchedAt: 'now', ok: ['motion'], failed: [{ topic: 'color', error: 'HTTP 500' }] }),
  );
  const manifestPath = path.join(root, 'manifest.json');
  const lines = [];
  const code = await runDiff({
    args: ['--accept'], cacheDir, manifestPath, rulesDir: path.join(root, 'rules'), topics: ['motion', 'color'], out: (s) => lines.push(s),
  });
  assert.equal(code, 2);
  assert.ok(!fs.existsSync(manifestPath));
});

test('diff --accept writes the manifest when the fetch was clean', async () => {
  const root = tmp();
  const cacheDir = path.join(root, 'cache');
  fs.mkdirSync(cacheDir);
  fs.writeFileSync(path.join(cacheDir, 'motion.json'), JSON.stringify(fixture()));
  fs.writeFileSync(path.join(cacheDir, '_last-fetch.json'), JSON.stringify({ fetchedAt: 'now', ok: ['motion'], failed: [] }));
  const manifestPath = path.join(root, 'manifest.json');
  const code = await runDiff({
    args: ['--accept'], cacheDir, manifestPath, rulesDir: path.join(root, 'rules'), topics: ['motion'], out: () => {},
  });
  assert.equal(code, 0);
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(m.motion.changelogLatest, 'September 9, 2025');
  assert.equal(m.motion.title, 'Sample Motion');
  assert.equal(m.motion.fetchedAt, 'now');
  assert.match(m.motion.url, /human-interface-guidelines\/motion\.json$/);
});

test('diff reads citing rule IDs from rules/*.yaml', async () => {
  const root = tmp();
  const cacheDir = path.join(root, 'cache');
  const rulesDir = path.join(root, 'rules');
  fs.mkdirSync(cacheDir);
  fs.mkdirSync(rulesDir);
  fs.writeFileSync(path.join(cacheDir, 'motion.json'), JSON.stringify(fixture()));
  fs.writeFileSync(path.join(cacheDir, '_last-fetch.json'), JSON.stringify({ fetchedAt: 'now', ok: ['motion'], failed: [] }));
  fs.writeFileSync(path.join(rulesDir, 'motion.yaml'), '- id: MOT-01\n  source:\n    topic: motion\n- id: MOT-02\n  source:\n    topic: motion\n');
  const lines = [];
  const code = await runDiff({
    args: [], cacheDir, manifestPath: path.join(root, 'manifest.json'), rulesDir, topics: ['motion'], out: (s) => lines.push(s),
  });
  assert.equal(code, 0);
  assert.match(lines.join('\n'), /MOT-01, MOT-02/);
});
