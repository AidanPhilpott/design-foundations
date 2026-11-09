// Resolved tokens + colour roles -> dist/tailwind-preset.cjs (Tailwind 3). Every value is a var(--df-*) reference.
import { varName } from './css.mjs';

const ref = (path) => `var(${varName(path)})`;
const colorRef = (role) => `var(--df-color-${role.replace(/\./g, '-')})`;
const NUMERIC_DURATIONS = { 100: 'micro', 200: 'short', 300: 'medium', 500: 'long' };

/** Group resolved paths under `prefix.` of the given type -> [leaf key, path]. */
function leaves(resolved, prefix, type) {
  const out = [];
  for (const p of [...resolved.keys()].sort()) {
    if (!p.startsWith(`${prefix}.`) || resolved.get(p).type !== type) continue;
    const rest = p.slice(prefix.length + 1);
    if (!rest.includes('.')) out.push([rest, p]);
  }
  return out;
}

function nestColors(roles) {
  const colors = {};
  for (const role of roles) {
    const parts = role.split('.');
    let node = colors;
    parts.forEach((part, i) => {
      const last = i === parts.length - 1;
      if (last) {
        if (typeof node[part] === 'object') node[part].DEFAULT = colorRef(role);
        else node[part] = colorRef(role);
      } else {
        if (typeof node[part] === 'string') node[part] = { DEFAULT: node[part] };
        node[part] ??= {};
        node = node[part];
      }
    });
  }
  return colors;
}

export function emitPreset(resolved, roles) {
  const transitionDuration = {};
  for (const [key, path] of leaves(resolved, 'motion.duration', 'duration')) transitionDuration[key] = ref(path);
  for (const [num, name] of Object.entries(NUMERIC_DURATIONS)) transitionDuration[num] = ref(`motion.duration.${name}`);

  const transitionTimingFunction = {};
  for (const [key, path] of leaves(resolved, 'motion.ease', 'cubicBezier')) transitionTimingFunction[key] = ref(path);
  for (const [key, path] of leaves(resolved, 'motion.spring', 'spring')) transitionTimingFunction[`spring-${key}`] = ref(path);

  const spacing = {};
  for (const [key, path] of leaves(resolved, 'space', 'dimension')) spacing[key.replace(/_/g, '.')] = ref(path);

  const borderRadius = {};
  for (const [key, path] of leaves(resolved, 'radius', 'dimension')) borderRadius[key] = ref(path);

  const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const fontSize = {};
  for (const [key, path] of leaves(resolved, 'type', 'typography')) {
    const v = (suffix) => `var(${varName(path)}-${suffix})`;
    fontSize[kebab(key)] = [v('size'), { lineHeight: v('leading'), fontWeight: v('weight') }];
  }

  const target = {
    target: ref('a11y.target.default'),
    'target-min': ref('a11y.target.min'),
  };

  const preset = {
    theme: {
      extend: {
        transitionDuration,
        transitionTimingFunction,
        spacing,
        fontSize,
        borderRadius,
        colors: nestColors(roles),
        minWidth: target,
        minHeight: { ...target },
      },
    },
  };
  return `// design-foundations Tailwind 3 preset — generated, do not edit\nmodule.exports = ${JSON.stringify(preset, null, 2)};\n`;
}
