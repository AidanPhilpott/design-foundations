// Print one version's section of CHANGELOG.md (without its heading), for release notes.
// Usage: node scripts/changelog-section.mjs v0.4.0   (exits 1 if the version has no section)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function changelogSection(text, version) {
  const want = version.replace(/^v/, '');
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^## ${want.replace(/\./g, '\\.')}(?:\\s|$)`).test(l));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^## /.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.argv[2];
  const changelog = new URL('../CHANGELOG.md', import.meta.url);
  const notes = version && changelogSection(readFileSync(changelog, 'utf8'), version);
  if (!notes) {
    console.error(`no CHANGELOG.md section for ${version ?? '(no version given)'}`);
    process.exit(1);
  }
  console.log(notes);
}
