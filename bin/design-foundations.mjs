#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CACHE_HIG = path.join(ROOT, 'cache', 'hig');

async function ingest(args) {
  const [sub, ...rest] = args;
  if (sub === 'fetch') {
    const { runFetch } = await import('../ingest/fetch.mjs');
    return runFetch({ cacheDir: CACHE_HIG });
  }
  if (sub === 'diff') {
    const { runDiff } = await import('../ingest/diff.mjs');
    return runDiff({
      args: rest,
      cacheDir: CACHE_HIG,
      manifestPath: path.join(ROOT, 'ingest', 'manifest.json'),
      rulesDir: path.join(ROOT, 'rules'),
    });
  }
  console.error('usage: design-foundations ingest <fetch|diff [--accept]>');
  return 2;
}

async function buildCmd(args) {
  const opt = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const { build } = await import('../build/build.mjs');
  const { TokenError } = await import('../build/tokens.mjs');
  const { RulesError } = await import('../build/rules.mjs');
  try {
    await build({ out: opt('--out') ?? path.join(ROOT, 'dist'), project: opt('--project'), docsRoot: ROOT });
    return 0;
  } catch (e) {
    if (e instanceof TokenError || e instanceof RulesError) {
      console.error(e.message);
      return 2;
    }
    throw e;
  }
}

async function checkCmd(args) {
  const { runCheckCli } = await import('../check/cli.mjs');
  return runCheckCli(args);
}

// Later tasks add `sync` here: name -> async (args) => exit code.
export const commands = { ingest, build: buildCmd, check: checkCmd };

const USAGE = `usage: design-foundations <command> [args]

commands:
  ${Object.keys(commands).join('\n  ')}`;

export async function main(argv) {
  const [name, ...args] = argv;
  const handler = Object.hasOwn(commands, name ?? '') ? commands[name] : null;
  if (!handler) {
    console.error(USAGE);
    return 2;
  }
  return handler(args);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => { process.exitCode = code ?? 0; },
    (err) => { console.error(err?.stack ?? String(err)); process.exitCode = 2; },
  );
}
