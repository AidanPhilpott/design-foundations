import fs from 'node:fs';
import path from 'node:path';
import { TOPICS, hig2md, pageMeta, topicUrl } from './hig.mjs';

function writeAtomic(file, text) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

export async function fetchAll({ topics = TOPICS, cacheDir, fetchImpl = fetch }) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const ok = [];
  const failed = [];
  for (const topic of topics) {
    try {
      const res = await fetchImpl(topicUrl(topic));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const doc = JSON.parse(text);
      pageMeta(doc); // validates the shape before anything is written
      const md = hig2md(doc);
      const jsonTmp = path.join(cacheDir, `${topic}.json.${process.pid}.tmp`);
      const mdTmp = path.join(cacheDir, `${topic}.md.${process.pid}.tmp`);
      fs.writeFileSync(jsonTmp, text);
      fs.writeFileSync(mdTmp, md);
      fs.renameSync(jsonTmp, path.join(cacheDir, `${topic}.json`));
      fs.renameSync(mdTmp, path.join(cacheDir, `${topic}.md`));
      ok.push(topic);
    } catch (err) {
      failed.push({ topic, error: err?.message ?? String(err) });
    }
  }
  return { ok, failed };
}

export async function runFetch({ cacheDir, topics = TOPICS, fetchImpl = fetch, out = console.log }) {
  const result = await fetchAll({ topics, cacheDir, fetchImpl });
  writeAtomic(
    path.join(cacheDir, '_last-fetch.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), ...result }, null, 2),
  );
  out(`ingest fetch: ${result.ok.length} ok, ${result.failed.length} failed`);
  for (const f of result.failed) out(`  FAILED ${f.topic}: ${f.error}`);
  return result.failed.length ? 1 : 0;
}
