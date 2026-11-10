#!/usr/bin/env node
import path from 'node:path';
import { realpathSync } from 'node:fs';
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

const BAD_VALUE = Symbol('bad value');

/** Value after `flag`: undefined when the flag is absent, BAD_VALUE when it is missing or another flag. */
function flagValue(args, flag) {
  const i = args.indexOf(flag);
  if (i < 0) return undefined;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? BAD_VALUE : v;
}

async function buildCmd(args) {
  const out = flagValue(args, '--out');
  const project = flagValue(args, '--project');
  if (out === BAD_VALUE || project === BAD_VALUE) {
    console.error('usage: design-foundations build [--out <dir>] [--project <colours.json>]');
    return 2;
  }
  const { TokenError } = await import('../build/tokens.mjs');
  try {
    if (project) {
      // Project-only build: writes project.css and nothing else (no yaml/rules needed).
      const { buildProject } = await import('../build/base.mjs');
      console.log(`wrote ${path.relative(process.cwd(), buildProject(project)) || 'project.css'}`);
      return 0;
    }
    const { build } = await import('../build/build.mjs');
    const { RulesError } = await import('../build/rules.mjs');
    try {
      await build({ out: out ?? path.join(ROOT, 'dist'), docsRoot: ROOT });
    } catch (e) {
      if (e instanceof RulesError) {
        console.error(e.message);
        return 2;
      }
      throw e;
    }
    return 0;
  } catch (e) {
    if (e instanceof TokenError) {
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

async function syncCmd(args) {
  const to = flagValue(args, '--to');
  const skill = flagValue(args, '--skill');
  if (!to || to === BAD_VALUE || skill === BAD_VALUE) {
    console.error('usage: design-foundations sync --to <dir> [--skill <dir>]');
    return 2;
  }
  const { sync } = await import('../sync/sync.mjs');
  const { readFileSync } = await import('node:fs');
  const { version } = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  try {
    await sync({ to: path.resolve(to), skill: skill && path.resolve(skill), version });
  } catch (e) {
    console.error(e.message);
    return 1;
  }
  console.log(`synced design-foundations ${version} to ${to}${skill ? ` and the skill to ${skill}/design-foundations` : ''}`);
  return 0;
}

// name -> async (args) => exit code.
export const commands = { ingest, build: buildCmd, check: checkCmd, sync: syncCmd };

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

// Run when this file is the entry point, also through a symlink (npm's node_modules/.bin, npx).
const realOrSelf = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return path.resolve(p);
  }
};
if (process.argv[1] && realOrSelf(process.argv[1]) === realOrSelf(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).then(
    (code) => { process.exitCode = code ?? 0; },
    (err) => { console.error(err?.stack ?? String(err)); process.exitCode = 2; },
  );
}
