import { createHash } from 'node:crypto';

export const TOPICS = [
  'accessibility', 'app-icons', 'branding', 'color', 'dark-mode', 'icons', 'images', 'inclusion',
  'layout', 'materials', 'motion', 'privacy', 'right-to-left', 'typography', 'writing',
];

export const HIG_BASE = 'https://developer.apple.com/tutorials/data/design/human-interface-guidelines';
export const topicUrl = (topic) => `${HIG_BASE}/${topic}.json`;

function inline(nodes, refs) {
  let out = '';
  for (const n of nodes ?? []) {
    switch (n.type) {
      case 'text': out += n.text; break;
      case 'codeVoice': out += `\`${n.code}\``; break;
      case 'reference': {
        const r = refs[n.identifier];
        out += r?.title || String(n.identifier ?? '').split('/').pop();
        break;
      }
      case 'image': break;
      default: out += inline(n.inlineContent, refs);
    }
  }
  return out;
}

const flat = (s) => s.replace(/\s*\n\s*/g, ' ').trim();

function blocks(bs, refs, depth = 0) {
  const out = [];
  for (const b of bs ?? []) {
    switch (b.type) {
      case 'heading':
        out.push(`\n${'#'.repeat(b.level ?? 2)} ${b.text}`);
        break;
      case 'paragraph':
        out.push(inline(b.inlineContent, refs));
        break;
      case 'unorderedList':
      case 'orderedList':
        (b.items ?? []).forEach((it, i) => {
          const marker = b.type === 'orderedList' ? `${i + 1}.` : '-';
          out.push(`${'  '.repeat(depth)}${marker} ${flat(blocks(it.content, refs, depth + 1).join(' '))}`);
        });
        break;
      case 'aside':
        out.push(`> ${b.name ?? b.style ?? 'Note'}: ${flat(blocks(b.content, refs).join(' '))}`);
        break;
      case 'table':
        (b.rows ?? []).forEach((row, i) => {
          out.push(`| ${row.map((c) => flat(blocks(c, refs).join(' ')).replace(/\|/g, '\\|')).join(' | ')} |`);
          if (i === 0) out.push(`| ${row.map(() => '---').join(' | ')} |`);
        });
        break;
      case 'tabNavigator':
        for (const tab of b.tabs ?? []) {
          out.push(`**[${tab.title ?? ''}]**`);
          out.push(...blocks(tab.content, refs, depth));
        }
        break;
      case 'row':
        for (const c of b.columns ?? []) out.push(...blocks(c.content, refs, depth));
        break;
      default:
        if (Array.isArray(b.content)) out.push(...blocks(b.content, refs, depth));
    }
  }
  return out;
}

export function hig2md(doc) {
  const refs = doc.references ?? {};
  const md = [`# ${doc.metadata?.title ?? ''}`, inline(doc.abstract, refs)];
  for (const s of doc.primaryContentSections ?? []) md.push(...blocks(s.content, refs));
  return md.join('\n');
}

function plainCell(cell) {
  return flat(blocks(cell, {}).join(' '));
}

export function pageMeta(doc) {
  const title = doc?.metadata?.title;
  if (!title || !Array.isArray(doc.primaryContentSections)) {
    throw new Error('unexpected page shape: missing metadata.title or primaryContentSections');
  }
  let changelogLatest = null;
  for (const s of doc.primaryContentSections) {
    const content = s.content ?? [];
    const i = content.findIndex((b) => b.type === 'heading' && /^change log$/i.test(b.text ?? ''));
    if (i < 0) continue;
    const table = content.slice(i + 1).find((b) => b.type === 'table');
    const first = table?.rows?.[1]?.[0];
    if (first) changelogLatest = plainCell(first) || null;
    break;
  }
  const contentHash = createHash('sha256').update(hig2md(doc)).digest('hex');
  return { title, changelogLatest, contentHash };
}
