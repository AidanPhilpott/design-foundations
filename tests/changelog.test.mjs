import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changelogSection } from '../scripts/changelog-section.mjs';

const sample = '# Changelog\n\n## 0.2.0\n\nTwo.\n\n- b\n\n## 0.1.0 (unreleased)\n\nOne.\n';

test('returns one section without its heading, stopping at the next', () => {
  assert.equal(changelogSection(sample, 'v0.2.0'), 'Two.\n\n- b');
  assert.equal(changelogSection(sample, '0.1.0'), 'One.');
});

test('unknown or partial versions return null', () => {
  assert.equal(changelogSection(sample, '0.3.0'), null);
  assert.equal(changelogSection(sample, '0.2'), null);
  assert.equal(changelogSection(sample, '0x2x0'), null);
});

test('the current package version has a CHANGELOG section (the release workflow needs it)', () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(changelogSection(readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8'), version));
});
