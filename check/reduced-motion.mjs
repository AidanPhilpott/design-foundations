// reduced-motion: timing that bypasses the --df- tokens, infinite animations with no Reduce Motion replacement,
// blanket "kill all animation" rules, smooth scrolling, and camera/scroll calls that skip motion.js.
import { registerCheck } from './registry.mjs';
import { fileDecls, isCustomProp, declSnippet } from './decls.mjs';
import { rawReasons } from './raw-values.mjs';
import { stripJsComments } from './scan.mjs';

// MOT-05 Reduce Motion replaces movement and keeps feedback, MOT-08 no unstoppable/sustained loops,
// MOT-09 camera/scroll honour Reduce Motion, MOT-10 no blanket kill.
export const REDUCED_MOTION_RULE_IDS = ['MOT-05', 'MOT-08', 'MOT-09', 'MOT-10'];

const squash = (s) => s.replace(/\s+/g, ' ').trim();
const noImportant = (v) => v.replace(/\s*!\s*important\s*$/i, '').trim();
const inReduce = (d) => d.atRules.some((a) => /prefers-reduced-motion\s*:\s*reduce/i.test(a));
const inNoPref = (d) => d.atRules.some((a) => /prefers-reduced-motion\s*:\s*no-preference/i.test(a));
const parts = (selector) => selector.split(/,(?![^(]*\))/).map(squash).filter(Boolean);

// ---------- CSS ----------

const TIMED = /^(?:-webkit-)?(?:transition|animation)(?:-duration|-delay|-timing-function)?$/;
const ANIM = /^(?:-webkit-)?animation$/;
const ANIM_COUNT = /^(?:-webkit-)?animation-iteration-count$/;

const isInfinite = (d) => (ANIM.test(d.prop) && /(?<![\w-])infinite(?![\w-])/i.test(d.value)) || (ANIM_COUNT.test(d.prop) && /(?<![\w-])infinite(?![\w-])/i.test(d.value));

/** Does a declaration inside a reduce block stop/limit an animation? */
function stopsAnimation(d) {
  const v = noImportant(d.value).toLowerCase();
  if (ANIM.test(d.prop)) return v === 'none' || !/(?<![\w-])infinite(?![\w-])/.test(v);
  if (/^(?:-webkit-)?animation-name$/.test(d.prop)) return v === 'none';
  if (ANIM_COUNT.test(d.prop)) return !/(?<![\w-])infinite(?![\w-])/.test(v);
  if (/^(?:-webkit-)?animation-play-state$/.test(d.prop)) return v === 'paused';
  return false;
}

const KILLS = /^(?:-webkit-)?(?:animation|transition|animation-name|transition-property)$/;

function checkCss(ctx, out) {
  const tokenFiles = new Set(ctx.config.tokenFiles);
  const perFile = ctx.files.map((file) => ({ file, decls: fileDecls(file).filter((d) => !isCustomProp(d.prop)) }));

  // Parts of every selector that a reduce block stops animating (any file).
  const stopped = new Set();
  for (const { decls } of perFile) for (const d of decls) if (inReduce(d) && stopsAnimation(d)) for (const p of parts(d.selector)) stopped.add(p);

  for (const { file, decls } of perFile) {
    for (const d of decls) {
      const reduce = inReduce(d);
      if (reduce) {
        if (KILLS.test(d.prop) && noImportant(d.value).toLowerCase() === 'none' && parts(d.selector).some((p) => p.includes('*'))) {
          out.push({ file: file.path, line: d.line, snippet: declSnippet(d), ruleIds: ['MOT-10'], message: 'blanket kill: removing all animation under Reduce Motion also removes feedback; redefine the --df- motion tokens instead' });
        }
        continue;
      }
      if (!tokenFiles.has(file.path) && TIMED.test(d.prop)) {
        const reasons = rawReasons(d.prop, d.value).filter((r) => r === 'literal duration' || r === 'literal easing');
        if (reasons.length) out.push({ file: file.path, line: d.line, snippet: declSnippet(d), ruleIds: ['MOT-05'], message: `${d.prop} timing is not from tokens (${reasons.join(', ')}); use --df-motion-* variables` });
      }
      if (isInfinite(d) && !inNoPref(d)) {
        const ps = parts(d.selector);
        if (!ps.length || !ps.every((p) => stopped.has(p))) {
          out.push({ file: file.path, line: d.line, snippet: declSnippet(d), ruleIds: ['MOT-08'], message: 'infinite animation with no rule for the same selector inside @media (prefers-reduced-motion: reduce) that stops or limits it' });
        }
      }
      if (d.prop === 'scroll-behavior' && /^smooth\b/i.test(d.value) && !inNoPref(d)) {
        out.push({ file: file.path, line: d.line, snippet: declSnippet(d), ruleIds: ['MOT-09'], message: 'smooth scrolling outside @media (prefers-reduced-motion: no-preference)' });
      }
    }
  }
}

// ---------- JS / HTML scripts ----------

const blankAll = (s) => s.replace(/[^\r\n]/g, ' ');

/** JS source of a file, same length and line numbers: the file itself, or only the <script> contents of HTML. */
function scriptSource(file) {
  if (file.kind === 'js') return { text: file.text, moduleSrc: false };
  const html = file.text.replace(/<!--[\s\S]*?(?:-->|$)/g, blankAll);
  const chars = blankAll(html).split('');
  let moduleSrc = false;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const src = m[1].match(/\bsrc\s*=\s*["']?([^"'\s>]+)/i);
    if (src && /motion\.js(?:[?#].*)?$/.test(src[1]) && /\btype\s*=\s*["']?module/i.test(m[1])) moduleSrc = true;
    const at = m.index + m[0].indexOf('>') + 1;
    for (let i = 0; i < m[2].length; i++) chars[at + i] = m[2][i];
  }
  return { text: chars.join(''), moduleSrc };
}

/** Blank the contents of string and template literals (quotes kept), so only code remains. Input has no comments. */
function maskStrings(text) {
  let out = '';
  for (let i = 0; i < text.length; ) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < text.length && text[j] !== c && (c === '`' || text[j] !== '\n')) j += text[j] === '\\' ? 2 : 1;
      const stop = Math.min(j, text.length);
      out += c + blankAll(text.slice(i + 1, stop)) + (text[stop] === c ? c : '');
      i = text[stop] === c ? stop + 1 : stop;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const CONTROL = new Set(['if', 'for', 'while', 'switch', 'catch', 'with']);

/** Function bodies of masked code: [{start, end}] (indices of the braces). A `{` after `=>` or after `name(...)` that isn't a control keyword. */
function functionBodies(code) {
  const out = [];
  const stack = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') stack.push(i);
    else if (code[i] === '}' && stack.length) {
      const start = stack.pop();
      const before = code.slice(0, start).trimEnd();
      let fn = before.endsWith('=>');
      if (!fn && before.endsWith(')')) {
        let depth = 0;
        let k = before.length - 1;
        for (; k >= 0; k--) {
          if (before[k] === ')') depth++;
          else if (before[k] === '(' && --depth === 0) break;
        }
        const word = before.slice(0, Math.max(k, 0)).match(/([A-Za-z_$][\w$]*)\s*$/)?.[1];
        fn = !(word && CONTROL.has(word));
      }
      if (fn) out.push({ start, end: i });
    }
  }
  // Expression-bodied arrows: `(m) => expr` or `m => expr` runs to the next top-level `,` `;` or closing bracket.
  for (const m of code.matchAll(/=>\s*(?!\{)/g)) {
    const start = m.index + m[0].length;
    let depth = 0;
    let end = code.length;
    for (let i = start; i < code.length; i++) {
      const c = code[i];
      if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) { if (depth-- === 0) { end = i; break; } }
      else if (depth === 0 && (c === ';' || c === ',')) { end = i; break; }
    }
    out.push({ start: m.index, end });
  }
  return out;
}

const lineOf = (text, idx) => 1 + (text.slice(0, idx).match(/\n/g) ?? []).length;
const ROUTED = new Set(['camera', 'animate', 'scrollToTop']); // motion.js helpers themselves
const CALL = /([A-Za-z_$][\w$]*(?:\s*\??\.\s*[A-Za-z_$][\w$]*)*)\s*\(/g;

function checkScript(file, motionCalls, out) {
  if (/(?:^|\/)motion\.js$/.test(file.path)) return; // the helper itself is where the raw calls belong
  const { text, moduleSrc } = scriptSource(file);
  const stripped = stripJsComments(text);
  const code = maskStrings(stripped);
  const bodies = functionBodies(code);
  const imports = moduleSrc || /\bimport\b[^;]*?\bfrom\s*['"][^'"]*motion\.js['"]|\bimport\s*['"][^'"]*motion\.js['"]|\bimport\s*\(\s*['"][^'"]*motion\.js['"]/.test(stripped);
  const enclosing = (idx) => bodies.filter((b) => b.start < idx && idx < b.end);

  // Heuristic: with motion.js imported, a motionCalls call is accepted only inside a function that also asks
  // prefersReducedMotion(); motion.js's own camera()/animate()/scrollToTop() are always accepted. Anything else is a finding.
  if (motionCalls.length) {
    const want = new Set(motionCalls);
    for (const m of code.matchAll(CALL)) {
      const callee = m[1].replace(/\s+/g, '');
      const name = callee.split(/\??\./).at(-1);
      if (!want.has(name) || ROUTED.has(name)) continue;
      const before = code.slice(0, m.index).trimEnd();
      if (/\bfunction\s*\*?$/.test(before)) continue; // function flyTo(...)
      const open = m.index + m[0].length - 1;
      let depth = 0;
      let close = -1;
      for (let i = open; i < code.length; i++) {
        if (code[i] === '(') depth++;
        else if (code[i] === ')' && --depth === 0) { close = i; break; }
      }
      if (close >= 0 && /^\s*\{/.test(code.slice(close + 1)) && !callee.includes('.')) continue; // method definition
      const guarded = enclosing(m.index).some((b) => /prefersReducedMotion\s*\(/.test(code.slice(b.start, b.end)));
      if (imports && guarded) continue;
      out.push({ file: file.path, line: lineOf(code, m.index), snippet: `${callee}(`, ruleIds: ['MOT-09'], message: `${callee}() bypasses Reduce Motion; route it through motion.js (camera()/animate()/scrollToTop())` });
    }
  }

  for (const m of stripped.matchAll(/\bbehavior\s*:\s*(['"`])smooth\1/g)) {
    if (!code.startsWith('behavior', m.index)) continue; // inside a string
    const aware = enclosing(m.index).some((b) => /prefersReducedMotion\s*\(|prefers-reduced-motion/.test(stripped.slice(b.start, b.end)));
    if (aware) continue;
    out.push({ file: file.path, line: lineOf(code, m.index), snippet: m[0].replace(/\s+/g, ' '), ruleIds: ['MOT-09'], message: "behavior: 'smooth' without a Reduce Motion check; use scrollToTop() from motion.js or check prefersReducedMotion()" });
  }
}

registerCheck({
  id: 'reduced-motion',
  ruleIds: REDUCED_MOTION_RULE_IDS,
  run(ctx) {
    const out = [];
    checkCss(ctx, out);
    for (const file of ctx.files) if (file.kind !== 'css') checkScript(file, ctx.config.motionCalls, out);
    return out;
  },
});
