import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { build } from '../build/build.mjs';
import { emitColorCss } from '../build/color.mjs';

const require = createRequire(import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'df-tw-'));
await build({ out: dir });
const preset = require(join(dir, 'tailwind-preset.cjs'));
const ext = preset.theme.extend;
const tokensCss = readFileSync(join(dir, 'tokens.css'), 'utf8');
const schema = read('../tokens/roles.schema.json');
const example = read('../tokens/example.project.tokens.json');
const colorCss = emitColorCss(example, schema);

test('preset loads with require()', () => {
  assert.equal(typeof preset, 'object');
  assert.ok(ext);
});

test('duration-100 maps to var(--df-motion-duration-micro)', () => {
  assert.equal(ext.transitionDuration['100'], 'var(--df-motion-duration-micro)');
  assert.equal(ext.transitionDuration.micro, 'var(--df-motion-duration-micro)');
  assert.equal(ext.transitionDuration['200'], 'var(--df-motion-duration-short)');
  assert.equal(ext.transitionDuration['300'], 'var(--df-motion-duration-medium)');
  assert.equal(ext.transitionDuration['500'], 'var(--df-motion-duration-long)');
});

test('timing functions include eases and springs', () => {
  const t = ext.transitionTimingFunction;
  assert.equal(t.standard, 'var(--df-motion-ease-standard)');
  assert.equal(t.enter, 'var(--df-motion-ease-enter)');
  assert.equal(t.exit, 'var(--df-motion-ease-exit)');
  for (const s of ['smooth', 'snappy', 'bouncy']) assert.equal(t[`spring-${s}`], `var(--df-motion-spring-${s})`);
});

test('spacing keys: 0_5 becomes 0.5', () => {
  assert.equal(ext.spacing['0.5'], 'var(--df-space-0-5)');
  assert.equal(ext.spacing['4'], 'var(--df-space-4)');
  assert.equal(ext.spacing['0_5'], undefined);
});

test('fontSize references type vars', () => {
  assert.deepEqual(ext.fontSize.body, [
    'var(--df-type-body-size)',
    { lineHeight: 'var(--df-type-body-leading)', fontWeight: 'var(--df-type-body-weight)' },
  ]);
  assert.ok(ext.fontSize['large-title']);
  assert.match(tokensCss, /--df-type-body-size: 1\.0625rem;/);
  assert.match(tokensCss, /--df-type-body-leading: 1\.375rem;/);
  assert.match(tokensCss, /--df-type-title2-size: 1\.375rem;/);
});

test('borderRadius and target sizes', () => {
  assert.equal(ext.borderRadius.md, 'var(--df-radius-md)');
  assert.equal(ext.borderRadius.full, 'var(--df-radius-full)');
  assert.equal(ext.minWidth.target, 'var(--df-a11y-target-default)');
  assert.equal(ext.minHeight['target-min'], 'var(--df-a11y-target-min)');
});

test('colors nest by role and use DEFAULT for parent roles', () => {
  assert.equal(ext.colors.label.primary, 'var(--df-color-label-primary)');
  assert.equal(ext.colors.accent.DEFAULT, 'var(--df-color-accent)');
  assert.equal(ext.colors.accent.on, 'var(--df-color-accent-on)');
  assert.equal(ext.colors.separator.DEFAULT, 'var(--df-color-separator)');
  assert.equal(ext.colors.separator.opaque, 'var(--df-color-separator-opaque)');
  assert.equal(ext.colors.bg.grouped.primary, 'var(--df-color-bg-grouped-primary)');
  assert.equal(ext.colors.bg.primary, 'var(--df-color-bg-primary)');
});

test('every var(--df-*) in the preset is defined in tokens.css or the colour CSS', () => {
  const defined = new Set([...(tokensCss + colorCss).matchAll(/(--df-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const used = [...JSON.stringify(preset).matchAll(/var\((--df-[a-z0-9-]+)\)/g)].map((m) => m[1]);
  assert.ok(used.length > 50);
  const missing = used.filter((v) => !defined.has(v));
  assert.deepEqual(missing, []);
  assert.doesNotMatch(JSON.stringify(preset), /\d(px|rem|ms)/);
});

test('preset has fontSize.role-label', () => {
  assert.deepEqual(ext.fontSize['role-label'], [
    'var(--df-type-role-label-size)',
    { lineHeight: 'var(--df-type-role-label-leading)', fontWeight: 'var(--df-type-role-label-weight)', letterSpacing: 'var(--df-type-role-label-tracking)' },
  ]);
  for (const r of ['title', 'headline', 'body', 'footnote']) assert.ok(ext.fontSize[`role-${r}`], r);
  assert.match(tokensCss, /--df-type-role-label-size: 0\.75rem;/);
});
