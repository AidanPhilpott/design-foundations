// contrast: every required + declared colour pair of the project's role file, in every mode.
// fail -> configured severity; unresolvable -> always error; missing -> always warn.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { registerCheck } from './registry.mjs';
import { checkPairs } from '../build/color.mjs';

export const CONTRAST_RULE_IDS = ['COL-01', 'ACC-03'];

const schema = JSON.parse(readFileSync(new URL('../tokens/roles.schema.json', import.meta.url), 'utf8'));
// Text roles (label.*, link, accent.on) are COL-01 at whatever minimum the pair sets;
// everything else (status.*, separators, fills) is a non-text indicator, ACC-03.
const isTextRole = (role) => role.startsWith('label.') || role === 'link' || role === 'accent.on';
const r2 = (n) => Math.round(n * 100) / 100;

registerCheck({
  id: 'contrast',
  ruleIds: CONTRAST_RULE_IDS,
  run(ctx) {
    const { config, projectRoles } = ctx;
    if (!config.projectTokens || !projectRoles) return [];
    const lines = readFileSync(resolve(config.dir, config.projectTokens), 'utf8').split(/\r?\n/);
    const lineOf = (role) => {
      const needle = `"${role}"`;
      const i = lines.findIndex((l) => l.includes(needle));
      return i < 0 ? 1 : i + 1;
    };
    const out = [];
    for (const row of checkPairs(projectRoles, schema)) {
      if (row.status === 'pass') continue;
      const base = { file: config.projectTokens, line: lineOf(row.fg) };
      if (row.bg === null) {
        out.push({ ...base, severity: 'warn', snippet: `${row.fg} (missing role)`, message: `required colour role ${row.fg} is missing from the project tokens` });
        continue;
      }
      const pair = `${row.fg} on ${row.bg} (${row.mode})`;
      const ruleIds = [isTextRole(row.fg) ? 'COL-01' : 'ACC-03'];
      if (row.status === 'fail') {
        out.push({ ...base, ruleIds, snippet: pair, message: `${pair} has contrast ${r2(row.ratio)}:1, needs ${row.min}:1` });
      } else if (row.status === 'unresolvable') {
        out.push({ ...base, ruleIds, severity: 'error', snippet: pair, message: `${pair} is unresolvable: a colour could not be parsed (var(), color-mix() and similar cannot be checked)` });
      } else {
        out.push({ ...base, ruleIds, severity: 'warn', snippet: pair, message: `${pair} is missing: no value to check (needs ${row.min}:1)` });
      }
    }
    return out;
  },
});
