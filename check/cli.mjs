// `design-foundations check [--config path] [--root dir] [--update-baseline] [--format text|json]`
import { resolve } from 'node:path';
import { evaluate, loadConfig, writeBaseline, ConfigError } from './core.mjs';
import './index.mjs';

const USAGE = 'usage: design-foundations check [--config path] [--root dir] [--update-baseline] [--format text|json]';

/** Returns the exit code: 0 clean, 1 new errors, 2 config/usage error. io = {out(line), err(line)}. */
export function runCheckCli(args, io = { out: console.log, err: console.error }) {
  let configPath = './design-foundations.config.json';
  let root;
  let format = 'text';
  let update = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config' && args[i + 1]) configPath = args[++i];
    else if (a === '--root' && args[i + 1]) root = args[++i];
    else if (a === '--format' && ['text', 'json'].includes(args[i + 1])) format = args[++i];
    else if (a === '--update-baseline') update = true;
    else {
      io.err(`unknown or incomplete argument: ${a}\n${USAGE}`);
      return 2;
    }
  }
  try {
    const config = loadConfig(configPath, { root });
    const res = evaluate(config);
    if (update) {
      const n = writeBaseline(resolve(config.dir, config.baseline), res.findings);
      io.out(`baseline updated: ${n} finding(s) in ${config.baseline} (${res.suppressed.length} suppressed)`);
      return 0;
    }
    const counts = { fresh: res.fresh.length, known: res.known.length, suppressed: res.suppressed.length };
    if (format === 'json') {
      io.out(JSON.stringify({ fresh: res.fresh, known: res.known, suppressed: res.suppressed, counts }, null, 2));
    } else {
      for (const f of res.fresh) io.out(`${f.file}:${f.line}  ${f.check}  [${f.ruleIds.join(', ')}]  ${f.message}`);
      io.out(`${counts.fresh} new, ${counts.known} known (baselined), ${counts.suppressed} suppressed`);
    }
    return res.fresh.some((f) => f.severity === 'error') ? 1 : 0;
  } catch (e) {
    if (e instanceof ConfigError) {
      io.err(e.message);
      return 2;
    }
    io.err(e.message ?? String(e));
    return 2;
  }
}
