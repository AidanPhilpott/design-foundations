// Check registry. Kept separate from index.mjs so check modules can register without an import cycle.
const registry = new Map();

/** Register (or replace, by id) a check module: {id, ruleIds, run(ctx) -> Finding[]}. */
export function registerCheck(mod) {
  if (!mod || typeof mod.id !== 'string' || typeof mod.run !== 'function') {
    throw new TypeError('a check module needs {id: string, ruleIds: string[], run(ctx)}');
  }
  registry.set(mod.id, mod);
}
export const getChecks = () => [...registry.values()];
export const checkIds = () => [...registry.keys()];
