#!/usr/bin/env node
// Copyright guard: `node scripts/overlap.mjs [n=12]` prints every run of n or more words (lowercased,
// punctuation stripped) that rules/*.yaml shares with cache/hig/*.md, and exits 1 if there is any.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const words = (text) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/** [{file, source, text}] — one entry per maximal shared run of at least n words. */
export function overlaps({ rules, sources, n = 12 }) {
  const grams = Object.entries(sources).map(([name, text]) => {
    const w = words(text);
    const set = new Set();
    for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
    return [name, set];
  });
  const found = [];
  for (const [file, text] of Object.entries(rules)) {
    const w = words(text);
    for (const [source, set] of grams) {
      let start = -1;
      let end = -1;
      for (let i = 0; i + n <= w.length; i++) {
        if (!set.has(w.slice(i, i + n).join(' '))) continue;
        if (start >= 0 && i <= end - n + 1) end = i + n;
        else {
          if (start >= 0) found.push({ file, source, text: w.slice(start, end).join(' ') });
          start = i;
          end = i + n;
        }
      }
      if (start >= 0) found.push({ file, source, text: w.slice(start, end).join(' ') });
    }
  }
  return found;
}

const readDir = (dir, ext) =>
  Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(ext)).sort().map((f) => [f, readFileSync(join(dir, f), 'utf8')]));

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const n = Number(process.argv[2] ?? 12);
  if (!Number.isInteger(n) || n < 1) {
    console.error('usage: node scripts/overlap.mjs [n=12]');
    process.exit(2);
  }
  if (!existsSync('cache/hig') || !existsSync('rules')) {
    console.error('needs rules/ and cache/hig/ in the current directory (run `design-foundations ingest fetch`)');
    process.exit(2);
  }
  const found = overlaps({ rules: readDir('rules', '.yaml'), sources: readDir('cache/hig', '.md'), n });
  for (const f of found) console.log(`rules/${f.file}  cache/hig/${f.source}  "${f.text}"`);
  console.log(`${found.length} shared run(s) of ${n}+ words`);
  process.exit(found.length ? 1 : 0);
}
