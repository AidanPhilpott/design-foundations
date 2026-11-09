// Rules: load rules/<topic>.yaml, validate against checks and tokens, emit docs/rules/*.md.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'yaml';
import { TOPICS } from '../ingest/hig.mjs';

export class RulesError extends Error {}

export const TOPIC_PREFIX = {
  accessibility: 'ACC', 'app-icons': 'ICO', branding: 'BRD', color: 'COL', 'dark-mode': 'DRK',
  icons: 'ICN', images: 'IMG', inclusion: 'INC', layout: 'LAY', materials: 'MAT', motion: 'MOT',
  privacy: 'PRV', 'right-to-left': 'RTL', typography: 'TYP', writing: 'WRT',
};
const REQUIRED = ['rule', 'why', 'source', 'severity', 'platforms', 'web'];
const SEVERITIES = ['must', 'should', 'consider'];
const PLATFORMS = ['web', 'swift'];
const VIAS = ['hig', 'swiftui-defaults', 'wcag'];

export const higPageUrl = (topic) => `https://developer.apple.com/design/human-interface-guidelines/${topic}`;

/** Every rule from dir/*.yaml (sorted by file), each tagged with `topic` from its filename. */
export function loadRules(dir) {
  if (!existsSync(dir)) return [];
  const rules = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.yaml')).sort()) {
    const topic = basename(f, '.yaml');
    let data;
    try {
      data = parse(readFileSync(join(dir, f), 'utf8'));
    } catch (e) {
      throw new RulesError(`${f}: ${e.message}`);
    }
    if (!Array.isArray(data)) throw new RulesError(`${f}: expected a list of rules`);
    for (const r of data) rules.push({ ...r, topic });
  }
  return rules;
}

/**
 * Errors (empty when valid). ctx: {checkIds: Set, tokenPaths: Set, checkRuleIds?: Map<checkId, ruleId[]>}.
 * checkRuleIds cross-checks only topics that have rules loaded, so topics can land one file at a time.
 */
export function validateRules(rules, { checkIds, tokenPaths, checkRuleIds = new Map() }) {
  const errs = [];
  const seen = new Set();
  for (const r of rules) {
    const id = r.id ?? '(no id)';
    const err = (msg) => errs.push(`${r.topic}.yaml ${id}: ${msg}`);
    const prefix = TOPIC_PREFIX[r.topic];
    if (!prefix) err(`unknown topic "${r.topic}"`);
    if (typeof r.id !== 'string' || !/^[A-Z]{3}-\d{2,}$/.test(r.id)) err('id must look like ABC-01');
    else {
      if (seen.has(r.id)) err(`duplicate id ${r.id}`);
      seen.add(r.id);
      if (prefix && !r.id.startsWith(`${prefix}-`)) err(`id ${r.id} does not use the topic's prefix ${prefix}`);
    }
    for (const k of REQUIRED) if (r[k] === undefined || r[k] === null || r[k] === '') err(`missing "${k}"`);
    for (const k of ['rule', 'why', 'web']) if (r[k] !== undefined && typeof r[k] !== 'string') err(`"${k}" must be a string`);
    if (r.severity !== undefined && !SEVERITIES.includes(r.severity)) err(`severity "${r.severity}" is not ${SEVERITIES.join('|')}`);
    if (r.platforms !== undefined && !(Array.isArray(r.platforms) && r.platforms.length && r.platforms.every((p) => PLATFORMS.includes(p)))) {
      err(`platforms must be a non-empty list of ${PLATFORMS.join('|')}`);
    }
    if (r.source != null) {
      const s = r.source;
      if (typeof s !== 'object' || Array.isArray(s)) err('source must be {topic, anchor, via}');
      else {
        if (!TOPICS.includes(s.topic)) err(`source.topic "${s.topic}" is not a covered HIG topic`);
        if (typeof s.anchor !== 'string' || !s.anchor) err('missing "source.anchor"');
        if (!VIAS.includes(s.via)) err(`source.via "${s.via}" is not ${VIAS.join('|')}`);
      }
    }
    if (r.check !== undefined) {
      if (!checkIds.has(r.check)) err(`unknown check "${r.check}"`);
      else if (checkRuleIds.has(r.check) && !checkRuleIds.get(r.check).includes(r.id)) {
        err(`check "${r.check}" does not report ${r.id}`);
      }
    }
    if (r.tokens !== undefined) {
      if (!Array.isArray(r.tokens)) err('tokens must be a list');
      else for (const t of r.tokens) if (!tokenPaths.has(t)) err(`unknown token "${t}"`);
    }
  }
  const prefixes = new Set(rules.map((r) => TOPIC_PREFIX[r.topic]).filter(Boolean));
  for (const [checkId, ids] of checkRuleIds) {
    for (const id of ids) {
      if (prefixes.has(id.split('-')[0]) && !seen.has(id)) errs.push(`check ${checkId}: rule ${id} is not defined`);
    }
  }
  return errs;
}

/** Validation context from the real check registry and base tokens. */
export async function ruleContext(resolved) {
  const { getChecks } = await import('../check/index.mjs');
  if (!resolved) resolved = (await import('./build.mjs')).baseTokens();
  const checks = getChecks();
  return {
    checkIds: new Set(checks.map((c) => c.id)),
    checkRuleIds: new Map(checks.map((c) => [c.id, [...(c.ruleIds ?? [])]])),
    tokenPaths: new Set(resolved.keys()),
  };
}

const HEADER = '<!-- generated from rules/*.yaml by `design-foundations build` — do not edit -->';
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const byId = (a, b) => a.id.localeCompare(b.id, 'en', { numeric: true });

function topicDoc(topic, rules) {
  const lines = [HEADER, '', `# ${topic} rules`, ''];
  lines.push(`Paraphrased from the Apple Human Interface Guidelines page for this topic: ${higPageUrl(topic)}`, '');
  for (const r of rules) {
    lines.push(`## ${r.id} (${r.severity})`, '', r.rule, '', `- Why: ${r.why}`, `- Web: ${r.web}`);
    lines.push(`- Platforms: ${r.platforms.join(', ')}`);
    const s = r.source;
    lines.push(`- Source: [${s.topic}](${higPageUrl(s.topic)}), "${s.anchor}" (via ${s.via})`);
    if (r.check) lines.push(`- Check: \`${r.check}\``);
    if (r.tokens?.length) lines.push(`- Tokens: ${r.tokens.map((t) => `\`${t}\``).join(', ')}`);
    lines.push('');
  }
  return lines.join('\n');
}

/** {'docs/rules/<topic>.md': md, ..., 'docs/rules/index.md': md}. Assumes validated rules. */
export function emitRuleDocs(rules) {
  const topics = new Map();
  for (const r of [...rules].sort(byId)) {
    if (!topics.has(r.topic)) topics.set(r.topic, []);
    topics.get(r.topic).push(r);
  }
  const out = {};
  const index = [HEADER, '', '# Rules index', '', '| ID | Severity | Check | Rule |', '|---|---|---|---|'];
  for (const topic of [...topics.keys()].sort()) {
    const list = topics.get(topic);
    out[`docs/rules/${topic}.md`] = topicDoc(topic, list);
    for (const r of list) {
      index.push(`| [${r.id}](${topic}.md#${r.id.toLowerCase()}-${r.severity}) | ${r.severity} | ${r.check ? `\`${r.check}\`` : ''} | ${cell(r.rule)} |`);
    }
  }
  out['docs/rules/index.md'] = index.join('\n') + '\n';
  return out;
}
