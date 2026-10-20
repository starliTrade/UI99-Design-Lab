import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * THE ZERO-ABSOLUTE STATE, DETECTED NOT ASSUMED.
 *
 * Several guards in this suite end with a reachability assertion — "the guard
 * is looking at real files, so it cannot pass by finding nothing". They are the
 * most valuable line in their test, and they are exactly the line that a
 * deliberate zero breaks: `src/components` was emptied on purpose (2026-10-20)
 * so every component can be reborn from policy → law → engine.
 *
 * Skipping them silently would be worse than failing — a guard asleep is a
 * guard forgotten. So the skip is CONDITIONAL on the real state of the tree:
 * the moment a component file exists again (scaffolding does not count), these
 * assertions re-arm by themselves and a reborn library that violates the rule
 * fails the suite on the day it does.
 */
const SRC = resolve(process.cwd(), 'src');
const COMPONENTS = join(SRC, 'components');

/** Scaffolding is not a component: it is the mould a component is poured into. */
const SCAFFOLD_DIRS = new Set(['__matrix__', '_template']);

function walk(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '__tests__' || SCAFFOLD_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry) && !entry.startsWith('README')) out.push(full);
  }
  return out;
}

/** True while the library is at zero absolute: no component files exist yet. */
export const ZERO_ABSOLUTE = walk(COMPONENTS).length === 0;

/**
 * Use as `it.skipIf(ZERO_ABSOLUTE)(…)`.
 * The reason is written here once so every skipped guard says the same true
 * thing instead of inventing its own excuse.
 */
export const ZERO_REASON =
  'zero absolute: src/components is empty by decision (2026-10-20) — this reachability guard re-arms the day the first component is born';
