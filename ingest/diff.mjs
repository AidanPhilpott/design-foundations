import fs from 'node:fs';
import path from 'node:path';
import { TOPICS, pageMeta, topicUrl } from './hig.mjs';

const same = (a, b) => a && b && a.contentHash === b.contentHash && a.changelogLatest === b.changelogLatest;

export function diffManifest(manifest, metas, ruleIdsByTopic = {}) {
  const changed = [];
  for (const [topic, to] of Object.entries(metas)) {
    const from = manifest[topic] ?? null;
    if (!same(from, to)) changed.push({ topic, from, to, ruleIds: ruleIdsByTopic[topic] ?? [] });
  }
  return { changed };
}

export async function loadRuleIdsByTopic(rulesDir) {
  const map = {};
  if (!fs.existsSync(rulesDir)) return map;
  const files = fs.readdirSync(rulesDir).filter((f) => /\.ya?ml$/.test(f)).sort();
  if (!files.length) return map;
  const { parse } = await import('yaml');
  for (const f of files) {
    const data = parse(fs.readFileSync(path.join(rulesDir, f), 'utf8'));
    const rules = Array.isArray(data) ? data : (data?.rules ?? []);
    for (const rule of rules) {
      const sources = Array.isArray(rule?.source) ? rule.source : [rule?.source];
      for (const s of sources) {
        const topic = s?.topic;
        if (!topic || !rule.id) continue;
        (map[topic] ??= []);
        if (!map[topic].includes(rule.id)) map[topic].push(rule.id);
      }
    }
  }
  return map;
}

function changelogRows(doc, limit = 3) {
  for (const s of doc.primaryContentSections ?? []) {
    const c = s.content ?? [];
    const i = c.findIndex((b) => b.type === 'heading' && /^change log$/i.test(b.text ?? ''));
    if (i < 0) continue;
    const table = c.slice(i + 1).find((b) => b.type === 'table');
    const cell = (x) => (x ?? []).flatMap((b) => (b.inlineContent ?? []).map((n) => n.text ?? n.code ?? '')).join('').trim();
    return (table?.rows ?? []).slice(1, 1 + limit).map((r) => `${cell(r[0])}: ${cell(r[1])}`);
  }
  return [];
}

export async function runDiff({ args = [], cacheDir, manifestPath, rulesDir, topics = TOPICS, out = console.log }) {
  const accept = args.includes('--accept');
  let last = null;
  const lastFile = path.join(cacheDir, '_last-fetch.json');
  if (fs.existsSync(lastFile)) last = JSON.parse(fs.readFileSync(lastFile, 'utf8'));
  if (accept && (!last || last.failed?.length)) {
    out(last
      ? `ingest diff: refusing --accept, last fetch failed for: ${last.failed.map((f) => f.topic).join(', ')}`
      : 'ingest diff: refusing --accept, no fetch record found (run "ingest fetch" first)');
    return 2;
  }
  const metas = {};
  const docs = {};
  const problems = [];
  for (const topic of topics) {
    const file = path.join(cacheDir, `${topic}.json`);
    if (!fs.existsSync(file)) { problems.push(`${topic}: not in cache`); continue; }
    try {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
      docs[topic] = doc;
      metas[topic] = { url: topicUrl(topic), ...pageMeta(doc), fetchedAt: last?.fetchedAt ?? null };
    } catch (err) {
      problems.push(`${topic}: ${err.message}`);
    }
  }
  if (accept && problems.length) {
    out(`ingest diff: refusing --accept, cache incomplete:\n  ${problems.join('\n  ')}`);
    return 2;
  }
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  const { changed } = diffManifest(manifest, metas, await loadRuleIdsByTopic(rulesDir));
  for (const p of problems) out(`warning: ${p}`);
  if (!changed.length) out('ingest diff: no changes since manifest');
  for (const c of changed) {
    out(`${c.topic}: ${c.from ? 'changed' : 'new (not in manifest)'}`);
    if (c.from) out(`  change log latest: ${c.from.changelogLatest ?? '-'} -> ${c.to.changelogLatest ?? '-'}`);
    for (const row of changelogRows(docs[c.topic])) out(`  log: ${row}`);
    out(`  cited by: ${c.ruleIds.length ? c.ruleIds.join(', ') : '(no rules)'}`);
  }
  if (accept) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify({ ...manifest, ...metas }, null, 2)}\n`);
    out(`ingest diff: manifest updated (${Object.keys(metas).length} topics)`);
  }
  return 0;
}
