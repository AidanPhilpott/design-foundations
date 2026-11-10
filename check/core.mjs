// Checker core: config, file collection, findings, fingerprints, baseline, df-allow.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { checkIds, getChecks } from './registry.mjs';
import { matchGlob, normalizePath } from './glob.mjs';
import { baseTokens } from '../build/base.mjs';

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

/** Check ids from spec §6 that are valid in a config before their module exists. */
export const PLANNED_CHECKS = ['raw-values', 'reduced-motion', 'contrast', 'text-floor', 'targets', 'focus', 'icons'];
export const SEVERITIES = ['error', 'warn', 'off'];
const TOP_KEYS = ['$schema', 'version', 'include', 'exclude', 'tokenFiles', 'projectTokens', 'checks', 'motionCalls', 'manifest', 'baseline', 'targetSelectors'];
const DEFAULT_INCLUDE = ['**/*.{css,html,htm,js,mjs,cjs,jsx,ts,tsx}'];
const KINDS = { '.css': 'css', '.html': 'html', '.htm': 'html', '.js': 'js', '.mjs': 'js', '.cjs': 'js', '.jsx': 'js', '.ts': 'js', '.tsx': 'js' };
const SKIP_DIRS = new Set(['node_modules', '.git']);

const strList = (v, key, dflt) => {
  if (v === undefined) return dflt;
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new ConfigError(`config "${key}" must be an array of strings`);
  return v;
};
const optStr = (v, key) => {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'string' || !v) throw new ConfigError(`config "${key}" must be a non-empty string`);
  return normalizePath(v);
};

/** Load and validate a project config. Paths in the result are relative to `dir` (the config's directory, or `root` when given). */
export function loadConfig(path, { root } = {}) {
  const configPath = resolve(path);
  if (!existsSync(configPath)) throw new ConfigError(`config not found: ${path}`);
  let raw;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (e) {
    throw new ConfigError(`cannot parse ${path}: ${e.message}`);
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new ConfigError(`${path}: config must be a JSON object`);
  const unknown = Object.keys(raw).filter((k) => !TOP_KEYS.includes(k));
  if (unknown.length) throw new ConfigError(`unknown config key(s): ${unknown.join(', ')}`);
  if (raw.version !== undefined && typeof raw.version !== 'string') throw new ConfigError('config "version" must be a string');

  const checks = raw.checks ?? {};
  if (typeof checks !== 'object' || Array.isArray(checks) || checks === null) throw new ConfigError('config "checks" must be an object');
  const valid = new Set([...PLANNED_CHECKS, ...checkIds()]);
  for (const [id, sev] of Object.entries(checks)) {
    if (!valid.has(id)) throw new ConfigError(`unknown check "${id}" in config (known: ${[...valid].sort().join(', ')})`);
    if (!SEVERITIES.includes(sev)) throw new ConfigError(`bad severity ${JSON.stringify(sev)} for check "${id}" (use ${SEVERITIES.join(', ')})`);
  }

  let rootDir = dirname(configPath);
  if (root) {
    rootDir = resolve(root);
    if (!existsSync(rootDir) || !statSync(rootDir).isDirectory()) throw new ConfigError(`root not found: ${root}`);
  }

  return {
    version: raw.version ?? null,
    dir: rootDir,
    configPath,
    include: strList(raw.include, 'include', DEFAULT_INCLUDE).map(normalizePath),
    exclude: strList(raw.exclude, 'exclude', []).map(normalizePath),
    tokenFiles: strList(raw.tokenFiles, 'tokenFiles', []).map(normalizePath),
    projectTokens: optStr(raw.projectTokens, 'projectTokens'),
    checks: { ...checks },
    motionCalls: strList(raw.motionCalls, 'motionCalls', []),
    manifest: optStr(raw.manifest, 'manifest'),
    targetSelectors: strList(raw.targetSelectors, 'targetSelectors', []),
    baseline: optStr(raw.baseline, 'baseline') ?? 'design-foundations.baseline.json',
  };
}

/** Severity for a check: config value, else "warn" (new checks default to warn). */
export const severityOf = (config, id) => config.checks[id] ?? 'warn';

// ---------- file collection ----------

function walk(dir, rel, out) {
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (SKIP_DIRS.has(e.name)) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(join(dir, e.name), r, out);
    else if (e.isFile()) out.push(r);
  }
}

export function collectFiles(config) {
  const all = [];
  walk(config.dir, '', all);
  const files = [];
  for (const rel of all) {
    const kind = KINDS[extname(rel).toLowerCase()];
    if (!kind) continue;
    if (!config.include.some((g) => matchGlob(g, rel))) continue;
    if (config.exclude.some((g) => matchGlob(g, rel) || rel.startsWith(`${normalizePath(g).replace(/\/+$/, '')}/`))) continue;
    files.push({ path: rel, text: readFileSync(join(config.dir, rel), 'utf8').replace(/^﻿/, ''), kind });
  }
  return files;
}

export function buildContext(config) {
  let projectRoles = null;
  if (config.projectTokens) {
    const p = resolve(config.dir, config.projectTokens);
    try {
      projectRoles = JSON.parse(readFileSync(p, 'utf8'));
    } catch (e) {
      throw new ConfigError(`cannot load projectTokens ${config.projectTokens}: ${e.message}`);
    }
  }
  return { files: collectFiles(config), config, tokens: baseTokens(), projectRoles };
}

// ---------- fingerprints, baseline, df-allow ----------

const normSnippet = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** sha1(check + file + normalised snippet + occurrence). */
export function fingerprint(finding, occurrence = 0) {
  return createHash('sha1').update([finding.check, finding.file, normSnippet(finding.snippet), occurrence].join('\0')).digest('hex');
}

/** Set `fingerprint` on each finding; occurrence counts identical (check, file, snippet) earlier in the file. */
export function assignFingerprints(findings) {
  const seen = new Map();
  for (const f of sortFindings(findings)) {
    const key = [f.check, f.file, normSnippet(f.snippet)].join('\0');
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    f.fingerprint = fingerprint(f, n);
  }
  return findings;
}

const sortFindings = (fs) => [...fs].sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || (a.check < b.check ? -1 : a.check > b.check ? 1 : 0)));

export function loadBaseline(path) {
  if (!existsSync(path)) return { version: 1, fingerprints: {} };
  try {
    const b = JSON.parse(readFileSync(path, 'utf8'));
    if (!b || typeof b.fingerprints !== 'object' || b.fingerprints === null) throw new Error('missing "fingerprints"');
    return b;
  } catch (e) {
    throw new ConfigError(`cannot load baseline ${path}: ${e.message}`);
  }
}

export function applyBaseline(findings, baseline) {
  if (findings.some((f) => !f.fingerprint)) assignFingerprints(findings);
  const known = baseline?.fingerprints ?? {};
  const fresh = [];
  const old = [];
  for (const f of findings) (Object.hasOwn(known, f.fingerprint) ? old : fresh).push(f);
  return { fresh, known: old };
}

export function writeBaseline(path, findings) {
  const entries = sortFindings(findings).map((f) => [f.fingerprint, { check: f.check, file: f.file, snippet: normSnippet(f.snippet) }]);
  writeFileSync(path, `${JSON.stringify({ version: 1, fingerprints: Object.fromEntries(entries) }, null, 2)}\n`);
  return entries.length;
}

const ALLOW = /df-allow\s+([\w-]+)\s*:([^\n]*)/g;
/** A df-allow only counts with a reason after the colon (comment closers do not count as one). */
const hasReason = (rest) => rest.replace(/\*\/|-->/g, '').trim() !== '';
function allowedChecks(lines, line) {
  const ids = new Set();
  // The preceding line counts only when it holds nothing but a comment.
  const commentOnly = (l) => l.replace(/\/\*.*?(?:\*\/|$)|\/\/.*$|<!--.*?(?:-->|$)|^(?:(?!\/\*).)*?\*\//g, '').trim() === '';
  const prev = lines[line - 2] ?? '';
  for (const l of [lines[line - 1], commentOnly(prev) ? prev : '']) for (const m of (l ?? '').matchAll(ALLOW)) if (hasReason(m[2])) ids.add(m[1]);
  return ids;
}

// ---------- running ----------

export function runChecks(config, ctx) {
  const findings = [];
  for (const mod of getChecks()) {
    const severity = severityOf(config, mod.id);
    if (severity === 'off') continue;
    let result;
    try {
      result = mod.run(ctx) ?? [];
    } catch (e) {
      throw new Error(`check "${mod.id}" crashed: ${e.stack ?? e}`);
    }
    for (const f of result) {
      findings.push({ ruleIds: mod.ruleIds ?? [], ...f, check: mod.id, severity: f.severity ?? severity, line: f.line ?? 1, snippet: f.snippet ?? '' });
    }
  }
  // A df-allow without a reason suppresses nothing and is itself a finding.
  for (const file of ctx.files) {
    file.text.split(/\r?\n/).forEach((l, i) => {
      for (const m of l.matchAll(ALLOW)) {
        const severity = severityOf(config, m[1]);
        if (!hasReason(m[2]) && severity !== 'off') {
          findings.push({ ruleIds: [], check: m[1], severity, file: file.path, line: i + 1, snippet: normSnippet(l), message: 'df-allow needs a reason' });
        }
      }
    });
  }
  assignFingerprints(findings);

  const texts = new Map(ctx.files.map((f) => [f.path, f.text.split(/\r?\n/)]));
  const linesOf = (file) => {
    if (!texts.has(file)) {
      const p = join(config.dir, file);
      texts.set(file, existsSync(p) ? readFileSync(p, 'utf8').split(/\r?\n/) : []);
    }
    return texts.get(file);
  };
  const kept = [];
  const suppressed = [];
  for (const f of sortFindings(findings)) (allowedChecks(linesOf(f.file), f.line).has(f.check) ? suppressed : kept).push(f);
  return { findings: kept, suppressed };
}

/** Load config, run checks, split by baseline. opts.baseline overrides the baseline file. */
export function evaluate(configOrPath, opts = {}) {
  const config = typeof configOrPath === 'string' ? loadConfig(configOrPath) : configOrPath;
  const ctx = buildContext(config);
  const { findings, suppressed } = runChecks(config, ctx);
  const baseline = opts.baseline ?? loadBaseline(resolve(config.dir, config.baseline));
  const { fresh, known } = applyBaseline(findings, baseline);
  return { config, findings, fresh, known, suppressed };
}
