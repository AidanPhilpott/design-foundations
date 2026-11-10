// Scanners for the checks: a small CSS tokenizer and regex heuristics for HTML/JS sources.
// Stripping comments/strings replaces them with spaces so line numbers and columns are unchanged.

const blank = (s) => s.replace(/[^\r\n]/g, ' ');

/** Blank CSS comments and the inside of quoted strings (quotes kept). */
export function stripCss(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += blank(text.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c && text[j] !== '\n') j += text[j] === '\\' ? 2 : 1;
      const stop = Math.min(j, text.length);
      out += c + blank(text.slice(i + 1, stop)) + (text[stop] === c ? c : '');
      i = text[stop] === c ? stop + 1 : stop;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const squash = (s) => s.replace(/\s+/g, ' ').trim();
const lineAt = (text, idx) => {
  let n = 1;
  for (let i = text.indexOf('\n'); i >= 0 && i < idx; i = text.indexOf('\n', i + 1)) n++;
  return n;
};

/**
 * Declarations of a stylesheet: {prop, value, line, selector, atRules}.
 * atRules lists enclosing at-rule preludes (@media, @supports, @keyframes, ...), outermost first.
 */
export function scanCss(text) {
  const src = stripCss(text);
  const out = [];
  const stack = []; // {kind: 'at'|'rule', prelude}
  let segStart = 0;
  let line = 1;
  let segLine = 1;
  let paren = 0;
  const atRules = () => stack.filter((b) => b.kind === 'at').map((b) => b.prelude);

  const flushDecl = (end) => {
    const seg = src.slice(segStart, end);
    const colon = seg.indexOf(':');
    const top = stack.at(-1);
    if (!top || colon < 0) return;
    const lead = seg.length - seg.trimStart().length;
    const declLine = segLine + (seg.slice(0, lead).match(/\n/g) ?? []).length;
    const prop = seg.slice(0, colon).trim();
    const value = squash(seg.slice(colon + 1));
    if (!prop || !value) return;
    const rule = [...stack].reverse().find((b) => b.kind === 'rule');
    out.push({ prop, value, line: declLine, selector: top.kind === 'rule' ? top.prelude : (rule?.prelude ?? ''), atRules: atRules() });
  };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '\n') { line++; continue; }
    if (c === '{' || c === '}') paren = 0; // an unbalanced "(" must not swallow the rest of the file
    if (c === '(') paren++;
    else if (c === ')') paren = Math.max(0, paren - 1);
    else if (paren > 0) continue;
    else if (c === '{') {
      const prelude = src.slice(segStart, i).trim();
      stack.push({ kind: prelude.startsWith('@') ? 'at' : 'rule', prelude: prelude.startsWith('@') ? squash(prelude) : prelude });
      segStart = i + 1;
      segLine = line;
    } else if (c === ';') {
      flushDecl(i);
      segStart = i + 1;
      segLine = line;
    } else if (c === '}') {
      flushDecl(i);
      stack.pop();
      segStart = i + 1;
      segLine = line;
    }
  }
  flushDecl(src.length); // final declaration without a terminating ";" or "}"
  return out;
}

/** Declarations of an inline `style` attribute value starting at `line`. */
export function scanInlineStyle(value, line = 1) {
  return scanCss(`x{${value}}`).map((d) => ({ ...d, line: d.line + line - 1, selector: '', atRules: [] }));
}

// ---------- HTML / JS sources ----------

function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?(?:-->|$)/g, blank);
}

/** Blank JS comments, leaving string/template contents alone. */
export function stripJsComments(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') {
      let j = text.indexOf('\n', i);
      if (j < 0) j = text.length;
      out += blank(text.slice(i, j));
      i = j;
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += blank(text.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < text.length && text[j] !== c && (c === '`' || text[j] !== '\n')) j += text[j] === '\\' ? 2 : 1;
      const stop = Math.min(j + 1, text.length);
      out += text.slice(i, stop);
      i = stop;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'await', 'new', 'import', 'super', 'with', 'else', 'do', 'void', 'delete', 'in', 'of', 'yield', 'throw', 'case']);

/** Index just past the bracket matching the opener at `open`, or -1. Strings are skipped. */
function matchClose(text, open) {
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const want = pairs[text[open]];
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      i++;
      while (i < text.length && text[i] !== c) i += text[i] === '\\' ? 2 : 1;
    } else if (c === text[open]) depth++;
    else if (c === want && --depth === 0) return i + 1;
  }
  return -1;
}

/**
 * Pieces of an HTML or JS/JSX/TSX source the checks care about:
 *   {kind: 'style', value, line}      inline style attribute, or style={{...}} (raw object text)
 *   {kind: 'class', value, line}      class / className string
 *   {kind: 'css-block', value, line}  <style> contents (line = first line of value)
 *   {kind: 'call', value, name, args, line}  call sites: value is the callee (`map.flyTo`), name its last segment
 * opts.calls limits call sites to those names.
 */
export function scanSources(text, kind, opts = {}) {
  const src = kind === 'html' ? stripHtmlComments(text) : stripJsComments(text);
  const out = [];
  const push = (k, value, idx, extra = {}) => out.push({ kind: k, value, line: lineAt(src, idx), ...extra });

  if (kind === 'html') {
    for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)(?:<\/style\s*>|$)/gi)) {
      push('css-block', m[1], m.index + m[0].indexOf('>') + 1);
    }
  }
  for (const m of src.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) push('style', m[1] ?? m[2], m.index);
  for (const m of src.matchAll(/\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([^`]*)`\s*\})/g)) {
    push('class', m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5], m.index);
  }
  if (kind === 'js') {
    for (const m of src.matchAll(/\bstyle\s*=\s*\{\s*\{/g)) {
      const open = m.index + m[0].length - 1;
      const end = matchClose(src, open);
      if (end > 0) push('style', src.slice(open + 1, end - 1).trim(), m.index);
    }
    const want = opts.calls ? new Set(opts.calls) : null;
    for (const m of src.matchAll(/([A-Za-z_$][\w$]*(?:\s*\??\.\s*[A-Za-z_$][\w$]*)*)\s*\(/g)) {
      const callee = m[1].replace(/\s+/g, '');
      const name = callee.split(/\??\./).at(-1);
      if (KEYWORDS.has(callee)) continue;
      if (want && !want.has(name)) continue;
      const open = m.index + m[0].length - 1;
      const end = matchClose(src, open);
      push('call', callee, m.index, { name, args: end > 0 ? src.slice(open + 1, end - 1).trim() : '' });
    }
  }
  return out.sort((a, b) => a.line - b.line);
}
