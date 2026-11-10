import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { words, overlaps } from '../scripts/overlap.mjs';

const SCRIPT = new URL('../scripts/overlap.mjs', import.meta.url).pathname;

function fixture(rulesYaml, sourceMd) {
  const root = mkdtempSync(join(tmpdir(), 'df-overlap-'));
  mkdirSync(join(root, 'rules'));
  mkdirSync(join(root, 'cache', 'hig'), { recursive: true });
  writeFileSync(join(root, 'rules', 'color.yaml'), rulesYaml);
  writeFileSync(join(root, 'cache', 'hig', 'color.md'), sourceMd);
  return root;
}

const SOURCE = '# Color\n\nUse colour sparingly, so that **important** elements stand out against the rest of the screen.\n';

test('words lowercases and strips punctuation', () => {
  assert.deepEqual(words("Don't  rely, on **Colour**-alone!"), ['don', 't', 'rely', 'on', 'colour', 'alone']);
});

test('reports a shared run of n words despite case and punctuation', () => {
  const rules = '- rule: "Keep it calm: important elements STAND OUT against the rest, of the screen."\n';
  const found = overlaps({ rules: { 'color.yaml': rules }, sources: { 'color.md': SOURCE }, n: 8 });
  assert.equal(found.length, 1);
  assert.equal(found[0].file, 'color.yaml');
  assert.equal(found[0].source, 'color.md');
  assert.equal(found[0].text, 'important elements stand out against the rest of the screen');
});

test('runs shorter than n are not reported', () => {
  const rules = '- rule: Important elements stand out against everything else.\n';
  assert.deepEqual(overlaps({ rules: { 'color.yaml': rules }, sources: { 'color.md': SOURCE }, n: 8 }), []);
});

test('CLI exits 1 on overlap and 0 when clean, n from argv', () => {
  const dirty = fixture('- rule: important elements stand out against the rest of the screen\n', SOURCE);
  const r1 = spawnSync(process.execPath, [SCRIPT, '8'], { cwd: dirty, encoding: 'utf8' });
  assert.equal(r1.status, 1, r1.stderr);
  assert.match(r1.stdout, /color\.yaml.*color\.md.*important elements stand out/);
  const r2 = spawnSync(process.execPath, [SCRIPT, '12'], { cwd: dirty, encoding: 'utf8' });
  assert.equal(r2.status, 0, r2.stdout);
  const clean = fixture('- rule: Pick a calm palette and save strong colour for what matters.\n', SOURCE);
  const r3 = spawnSync(process.execPath, [SCRIPT, '8'], { cwd: clean, encoding: 'utf8' });
  assert.equal(r3.status, 0, r3.stdout);
});
