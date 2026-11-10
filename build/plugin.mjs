// Plugin references: rules/*.yaml + resolved tokens -> plugin/skills/design-foundations/references/*.md.
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitCss } from './css.mjs';
import { emitPreset } from './tailwind.mjs';
import { escapeMd, TOPIC_PREFIX } from './rules.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REFS_DIR = 'plugin/skills/design-foundations/references';
const HEADER = '<!-- generated from rules/*.yaml and the base tokens by `design-foundations build` — do not edit -->';
const SEVERITIES = [['must', 'Must'], ['should', 'Should'], ['consider', 'Consider']];

const one = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const title = (topic) => topic.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const byId = (a, b) => a.id.localeCompare(b.id, 'en', { numeric: true });

function topicRef(topic, rules) {
  const lines = [HEADER, '', `# ${title(topic)}`, '', 'Each line: `ID — rule — what to do on the web`. Details and sources: docs/rules/' + topic + '.md.', ''];
  for (const [sev, heading] of SEVERITIES) {
    const list = rules.filter((r) => r.severity === sev).sort(byId);
    if (!list.length) continue;
    lines.push(`## ${heading}`, '');
    for (const r of list) lines.push(`${r.id} — ${escapeMd(one(r.rule))} — ${escapeMd(one(r.web))}`);
    lines.push('');
  }
  return lines.join('\n');
}

/** `export function name(args)` signatures from src/motion.js, in source order. */
function motionExports() {
  const src = readFileSync(join(ROOT, 'src', 'motion.js'), 'utf8');
  return [...src.matchAll(/^export function (\w+)\(([^)]*)\)/gm)].map((m) => ({ name: m[1], args: one(m[2]).replace(/ = (?:DEFAULT_KEYFRAMES\[name\]|false|\{\})/g, '') }));
}

const NOTES = {
  prefersReducedMotion: 'true when the user asked for reduced motion (live)',
  onReducedMotionChange: 'cb(reduced) on every change; returns unsubscribe',
  duration: 'ms for a duration token name; camera durations are 0 under Reduce Motion',
  transition: '{duration, easing, properties, distance?} for the current Reduce Motion setting',
  camera: 'flyTo/flyToBounds on a Leaflet-style map; instant under Reduce Motion',
  scrollToTop: 'smooth only when motion is allowed',
  animate: 'Web Animations wrapper; push/pop/rise have default keyframes; reduced = fade only',
};

function flattenPreset(node, prefix = []) {
  const out = [];
  for (const [k, v] of Object.entries(node)) {
    const path = k === 'DEFAULT' ? prefix : [...prefix, k];
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flattenPreset(v, path));
    else out.push([path.join('.'), Array.isArray(v) ? v[0] : v]);
  }
  return out;
}

function tokensRef(resolved) {
  const css = emitCss(resolved);
  const vars = new Map();
  for (const m of css.matchAll(/^\s*(--df-[\w-]+):\s*(.+?);\s*$/gm)) if (!vars.has(m[1])) vars.set(m[1], m[2]);
  const groups = new Map();
  for (const [name, value] of vars) {
    const g = name.split('-')[3];
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(`${name}: ${value}`);
  }

  const schema = JSON.parse(readFileSync(join(ROOT, 'tokens', 'roles.schema.json'), 'utf8'));
  const preset = new Function('module', `${emitPreset(resolved, schema.roles)}; return module.exports;`)({ exports: {} });
  const L = [HEADER, '', '# Tokens cheat-sheet', '',
    'Use these instead of raw values. `dist/tokens.css` is the source; values below are the default (`:root`) ones. ' +
    'Reduce Motion, reduced transparency and Dynamic Type blocks reassign some of them automatically.', '',
    '## CSS variables', ''];
  for (const [g, lines] of groups) L.push(`### --df-${g}-*`, '', '```css', ...lines, '```', '');

  L.push('## Colour roles (project-defined)', '',
    'Colour values come from the project colour file, emitted as `project.css`. Every role is the variable `--df-color-<role>` with dots written as dashes:', '',
    '```', ...schema.roles.map((r) => `--df-color-${r.replace(/\./g, '-')}`), '```', '');

  L.push('## Tailwind preset (`dist/tailwind-preset.cjs`, Tailwind 3)', '',
    'Add `presets: [require("./vendor/design-foundations/tailwind-preset.cjs")]`. Every value is a `var(--df-*)` reference. Keys by theme section:', '');
  for (const [section, entries] of Object.entries(preset.theme.extend)) {
    L.push(`- ${section}: ${flattenPreset(entries).map(([k]) => '`' + k + '`').join(', ')}`);
  }
  L.push('');

  const durations = [...resolved.keys()].filter((p) => /^motion\.(duration|camera)\./.test(p) && resolved.get(p).type === 'duration').map((p) => { const [, group, key] = p.split('.'); return group === 'camera' ? `camera${key[0].toUpperCase()}${key.slice(1)}` : key; });
  const transitions = [...resolved.keys()].filter((p) => p.startsWith('motion.transition.')).map((p) => p.split('.').at(-1));
  L.push('## motion.js (`dist/motion.js` module, `dist/motion.global.js` classic script)', '',
    'Module: `import { transition, animate } from "./motion.js"`. Classic `<script src="motion.global.js">`: the same functions on `DFMotion` (for example `DFMotion.camera(map, [lat, lng], { zoom: 14 })`).', '');
  for (const e of motionExports()) L.push(`- \`${e.name}(${e.args})\` — ${NOTES[e.name] ?? ''}`.trimEnd());
  L.push('', `Duration names: ${durations.map((d) => '`' + d + '`').join(', ')}.`, `Transition names: ${transitions.map((t) => '`' + t + '`').join(', ')}.`, '');
  return L.join('\n');
}

/** {'plugin/skills/design-foundations/references/<topic>.md': md, ...} including tokens.md. Assumes validated rules. */
export function emitPluginRefs(rules, resolved) {
  const out = {};
  for (const topic of Object.keys(TOPIC_PREFIX)) {
    const list = rules.filter((r) => r.topic === topic);
    if (list.length) out[`${REFS_DIR}/${topic}.md`] = topicRef(topic, list);
  }
  out[`${REFS_DIR}/tokens.md`] = tokensRef(resolved);
  return out;
}
