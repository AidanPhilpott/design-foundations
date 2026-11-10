// `design-foundations build`: tokens/base -> dist/tokens.css + dist/tokens.json;
// rules/*.yaml -> validated, then docs/rules/*.md under docsRoot (opt-in).
// With `project`, only that project's project.css is written (see base.mjs).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { springCurve } from './spring.mjs';
import { emitCss } from './css.mjs';
import { baseTokens, buildProject, roleSchema, ROOT } from './base.mjs';
import { emitPreset } from './tailwind.mjs';
import { emitPluginRefs } from './plugin.mjs';
import { loadRules, validateRules, emitRuleDocs, ruleContext, RulesError } from './rules.mjs';

export { baseTokens, buildProject };

/** Flat {dotted path: value}; springs carry duration, bounce, easing and settleMs. */
export function flatten(resolved) {
  const out = {};
  for (const p of [...resolved.keys()].sort()) {
    const { type, value, ext } = resolved.get(p);
    out[p] = type === 'spring' ? { ...ext, ...springCurve(ext) } : value;
  }
  return out;
}

const toMs = (v) => (typeof v === 'number' ? v : /ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000);
const num = (v) => (typeof v === 'number' ? v : parseFloat(v));
const bezier = (v) => `cubic-bezier(${v.join(', ')})`;
const easingString = (v) => (Array.isArray(v) ? bezier(v) : typeof v === 'object' ? springCurve(v).easing : String(v));

/** The resolved motion values inlined into dist/motion.js (durations in ms, CSS easing strings). */
export function motionTokens(resolved) {
  const durations = {};
  for (const [p, { type, value }] of resolved) {
    if (type !== 'duration') continue;
    const [, group, key] = p.split('.');
    if (group === 'duration') durations[key] = toMs(value);
    else if (group === 'camera') durations[`camera${key[0].toUpperCase()}${key.slice(1)}`] = toMs(value);
  }
  const side = ({ properties, duration, easing, distance }) => ({
    duration: toMs(duration),
    easing: easingString(easing),
    properties: [...properties],
    ...(distance !== undefined ? { distance: num(distance) } : {}),
  });
  const transitions = {};
  for (const [p, { type, value }] of resolved) {
    if (type === 'transition') transitions[p.split('.').at(-1)] = { normal: side(value.normal), reduced: side(value.reduced) };
  }
  return { durations, transitions };
}

const PLACEHOLDER = '/*__DF_TOKENS__*/null';

/** Classic-script build of an ESM file: `export` keywords dropped, wrapped in an IIFE that sets globalThis[globalName]. */
export function toClassicScript(text, globalName) {
  const names = [];
  const body = text.replace(/^export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/gm, (m, name) => {
    names.push(name);
    return m.replace(/^export\s+/, '');
  });
  if (/^\s*(?:import|export)\s/m.test(body)) throw new Error(`cannot make a classic script: unsupported module syntax in ${globalName} source`);
  return `(function () {\n'use strict';\n${body}\nglobalThis.${globalName} = Object.freeze({ ${names.join(', ')} });\n})();\n`;
}

export async function build({ out = 'dist', project, srcDir = join(ROOT, 'src'), rulesDir = join(ROOT, 'rules'), docsRoot } = {}) {
  if (project) {
    buildProject(project);
    return;
  }
  const resolved = baseTokens();
  const rules = loadRules(rulesDir);
  const errs = validateRules(rules, await ruleContext(resolved));
  if (errs.length) throw new RulesError(`invalid rules:\n  ${errs.join('\n  ')}`);

  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'tokens.css'), emitCss(resolved));
  writeFileSync(join(out, 'tokens.json'), JSON.stringify(flatten(resolved), null, 2) + '\n');

  const schema = roleSchema();
  writeFileSync(join(out, 'tailwind-preset.cjs'), emitPreset(resolved, schema.roles));

  if (existsSync(srcDir)) {
    for (const f of readdirSync(srcDir).filter((n) => /\.(m?js)$/.test(n)).sort()) {
      const text = readFileSync(join(srcDir, f), 'utf8');
      if (text.includes(PLACEHOLDER)) {
        const built = text.replace(PLACEHOLDER, () => JSON.stringify(motionTokens(resolved), null, 2));
        writeFileSync(join(out, f), built);
        if (f === 'motion.js') writeFileSync(join(out, 'motion.global.js'), toClassicScript(built, 'DFMotion'));
      } else {
        copyFileSync(join(srcDir, f), join(out, f));
      }
    }
  }

  // docs/rules and the plugin references are written only when asked (the CLI passes the repo root), so tests never touch the repo.
  for (const [rel, text] of docsRoot ? Object.entries({ ...emitRuleDocs(rules), ...emitPluginRefs(rules, resolved) }) : []) {
    mkdirSync(dirname(join(docsRoot, rel)), { recursive: true });
    writeFileSync(join(docsRoot, rel), text);
  }
}
