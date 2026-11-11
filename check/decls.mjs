// Shared helpers for the style checks: every CSS declaration of a file, wherever it lives
// (stylesheet, <style> block, style attribute, JS style={{}} object), and every class token.
import { scanCss, scanInlineStyle, scanSources } from './scan.mjs';

const kebab = (s) => (/^[a-z-]+$/.test(s) ? s : s.replace(/^(webkit|moz|ms)(?=[A-Z])/i, (m) => `-${m.toLowerCase()}`).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));

/** Split on commas that are not inside brackets or strings. */
function splitTop(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      i++;
      while (i < text.length && text[i] !== c) i += text[i] === '\\' ? 2 : 1;
    } else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) {
      parts.push([start, text.slice(start, i)]);
      start = i + 1;
    }
  }
  parts.push([start, text.slice(start)]);
  return parts;
}

/** Properties the grid check reads: React treats a bare number on these as px. */
export const GRID_PROP = /^(?:(?:padding|margin|inset|scroll-margin|scroll-padding)(?:-[a-z]+)*|gap|row-gap|column-gap|grid-gap|grid-row-gap|grid-column-gap|top|right|bottom|left|(?:min-|max-)?(?:width|height|inline-size|block-size)|flex-basis|border(?:-[a-z]+){0,2}-radius)$/;

/** `{ color: "red", fontSize: 12 }` (inner text of a style object) -> declarations; dynamic values are skipped. */
function scanStyleObject(text, line) {
  const out = [];
  for (const [at, part] of splitTop(text)) {
    const m = part.match(/^\s*(?:([A-Za-z_$][\w$]*)|"([^"]+)"|'([^']+)')\s*:\s*([\s\S]*?)\s*$/);
    if (!m) continue;
    const prop = kebab(m[1] ?? m[2] ?? m[3]);
    const raw = m[4];
    let value = null;
    const str = raw.match(/^(?:"([^"]*)"|'([^']*)'|`([^`$]*)`)$/);
    if (str) value = str[1] ?? str[2] ?? str[3];
    else if (/^-?\d*\.?\d+$/.test(raw) && (prop === 'font-size' || GRID_PROP.test(prop))) value = `${raw}px`;
    if (value === null || !value.trim()) continue;
    const upto = text.slice(0, at + (part.length - part.trimStart().length));
    out.push({ prop, value: value.trim().replace(/\s+/g, ' '), line: line + (upto.match(/\n/g) ?? []).length, selector: '', atRules: [] });
  }
  return out;
}

/** {prop, value, line, selector, atRules}[] for a file, in source order per kind. */
export function fileDecls(file) {
  if (file.kind === 'css') return scanCss(file.text);
  const out = [];
  for (const it of scanSources(file.text, file.kind)) {
    if (it.kind === 'css-block') out.push(...scanCss(it.value).map((d) => ({ ...d, line: d.line + it.line - 1 })));
    else if (it.kind === 'style') {
      if (/;/.test(it.value) || file.kind === 'html') out.push(...scanInlineStyle(it.value, it.line));
      else out.push(...scanStyleObject(it.value, it.line));
    }
  }
  return out;
}

/** {value (the token), line}[] for every class / className token of an HTML or JS file. */
export function classTokens(file) {
  if (file.kind === 'css') return [];
  const out = [];
  for (const it of scanSources(file.text, file.kind)) {
    if (it.kind !== 'class') continue;
    for (const tok of it.value.split(/\s+/)) if (tok && !tok.includes('${')) out.push({ value: tok, line: it.line });
  }
  return out;
}

export const isCustomProp = (prop) => prop.startsWith('--');
export const declSnippet = (d) => `${d.prop}: ${d.value}`;
