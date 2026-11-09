// Colour parsing, WCAG 2.x contrast, role-pair checking and colour CSS emit (spec 4.4).

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function hex(s) {
  const h = s.slice(1);
  if (!/^[0-9a-f]+$/i.test(h)) return null;
  let full;
  if (h.length === 3 || h.length === 4) full = [...h].map((c) => c + c).join('');
  else if (h.length === 6 || h.length === 8) full = h;
  else return null;
  const n = (i) => parseInt(full.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
}

// "50%" -> 0.5 (percent) or plain number
function num(tok, pctScale = 1) {
  if (tok === undefined || tok === '') return null;
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(%?)$/.exec(tok);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return m[2] ? (v / 100) * pctScale : v;
}

function alphaOf(tok) {
  if (tok === undefined) return 1;
  const v = num(tok, 1);
  return v === null ? null : clamp(v, 0, 1);
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

export function parseColor(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (s.startsWith('#')) return hex(s);
  const m = /^(rgba?|hsla?)\(([^()]*)\)$/.exec(s);
  if (!m) return null;
  const parts = m[2].split(/\s*[,/]\s*|\s+/).filter((p) => p !== '');
  if (parts.length < 3 || parts.length > 4) return null;
  const alpha = alphaOf(parts[3]);
  if (alpha === null) return null;
  if (m[1].startsWith('rgb')) {
    const c = parts.slice(0, 3).map((p) => num(p, 255));
    if (c.some((v) => v === null)) return null;
    const [r, g, b] = c.map((v) => Math.round(clamp(v, 0, 255)));
    return { r, g, b, a: alpha };
  }
  const h = num(parts[0].replace(/deg$/, ''));
  const sat = parts[1].endsWith('%') ? num(parts[1], 1) : null;
  const lig = parts[2].endsWith('%') ? num(parts[2], 1) : null;
  if (h === null || sat === null || lig === null) return null;
  const [r, g, b] = hslToRgb(((h % 360) + 360) % 360, clamp(sat, 0, 1), clamp(lig, 0, 1));
  return { r, g, b, a: alpha };
}

function composite(fg, bg) {
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

function luminance({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const WHITE = { r: 255, g: 255, b: 255, a: 1 };
const BLACK = { r: 0, g: 0, b: 0, a: 1 };

/**
 * WCAG 2.x contrast ratio, unrounded. Returns null if either colour is unparseable.
 * A semi-transparent foreground is composited over the background. If the background
 * itself is semi-transparent it is first composited over `opts.over` (a colour string;
 * default white). checkPairs passes white for light modes and black for dark modes.
 */
export function contrast(fg, bg, opts = {}) {
  const f = parseColor(fg);
  let b = parseColor(bg);
  const base = opts.over === undefined ? WHITE : parseColor(opts.over);
  if (!f || !b || !base) return null;
  if (b.a < 1) b = composite(b, { ...base, a: 1 });
  const fo = f.a < 1 ? composite(f, b) : f;
  const l1 = luminance(fo);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const ALL_MODES = ['light', 'dark', 'light-hc', 'dark-hc'];
const baseOf = (mode) => mode.replace(/-hc$/, '');

// Slot value for a role in a mode; hc falls back to the normal slot.
function slot(project, role, mode) {
  const r = project.roles?.[role];
  if (!r) return undefined;
  return r[mode] ?? (mode.endsWith('-hc') ? r[baseOf(mode)] : undefined);
}

// Is the mode evaluated at all? hc modes are evaluated (via fallback) when listed
// or when their base mode is listed.
function modeActive(project, mode) {
  const modes = project.modes ?? ALL_MODES;
  return modes.includes(mode) || (mode.endsWith('-hc') && modes.includes(baseOf(mode)));
}

// `bg.*` -> every role starting with `bg.` (so bg.grouped.* included); otherwise literal.
function expand(name, roles) {
  if (!name.endsWith('.*')) return [name];
  const prefix = name.slice(0, -1);
  return roles.filter((r) => r.startsWith(prefix));
}

export function checkPairs(project, schema) {
  const roles = [...new Set([...schema.roles, ...Object.keys(project.roles ?? {})])];
  const pairs = [...(schema.pairs ?? []), ...(project.pairs ?? [])];
  const out = [];
  for (const p of pairs) {
    for (const fg of expand(p.fg, roles)) {
      for (const bg of expand(p.bg, roles)) {
        for (const mode of ALL_MODES) {
          const row = { fg, bg, mode, ratio: null, min: p.min, status: 'missing' };
          out.push(row);
          if (!modeActive(project, mode)) continue;
          const fv = slot(project, fg, mode);
          const bv = slot(project, bg, mode);
          if (fv === undefined || bv === undefined) continue;
          const ratio = contrast(fv, bv, { over: baseOf(mode) === 'dark' ? '#000' : '#fff' });
          if (ratio === null) { row.status = 'unresolvable'; continue; }
          row.ratio = ratio;
          row.status = ratio >= p.min ? 'pass' : 'fail';
        }
      }
    }
  }
  // Spec 4.4: missing is reported, never skipped. Required roles with no entry at all.
  for (const role of schema.required ?? []) {
    if (!project.roles?.[role]) out.push({ fg: role, bg: null, mode: null, ratio: null, min: null, status: 'missing' });
  }
  return out;
}

const varName = (role) => `--df-color-${role.replace(/\./g, '-')}`;

function decls(project, mode, { fallback = false } = {}) {
  const parts = [];
  for (const role of Object.keys(project.roles ?? {})) {
    const v = fallback ? slot(project, role, mode) : project.roles[role][mode];
    if (v !== undefined) parts.push(`${varName(role)}:${v}`);
  }
  return parts.join(';');
}

export function emitColorCss(project, schema) {
  void schema; // role list is not needed to emit; projects may add their own roles
  const blocks = [];
  const add = (open, mode, close = '}') => {
    const d = decls(project, mode);
    if (d) blocks.push(`${open}${d}${close}`);
  };
  add(':root{', 'light');
  add('@media (prefers-color-scheme: dark){:root{', 'dark', '}}');
  // Scoped to light so a dark-scheme user never gets a light-hc value; dark falls back to its dark slot.
  add('@media (prefers-contrast: more) and (prefers-color-scheme: light){:root{', 'light-hc', '}}');
  add('@media (prefers-color-scheme: dark) and (prefers-contrast: more){:root{', 'dark-hc', '}}');
  // An explicit [data-theme] overrides prefers-contrast (it carries only the normal slots).
  add('[data-theme="light"]{', 'light');
  add('[data-theme="dark"]{', 'dark');
  return blocks.join('\n') + '\n';
}
