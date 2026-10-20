import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { ZERO_ABSOLUTE } from './zero-state';

// vitest runs from the project root, so this is stable.
const SRC = resolve(process.cwd(), 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const FILES = walk(SRC).filter((f) => !f.includes('__tests__'));

/**
 * The source with its comments removed.
 *
 * The first version of this guard matched the whole file, and failed on its own
 * documentation — the retired name appears in the comments that explain WHY it
 * was retired. A guard that forbids explaining the rule is a guard nobody keeps.
 */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/**
 * THERE IS ONE SURFACE RESOLVER, AND THIS KEEPS IT THAT WAY.
 *
 * The engine had two. `getLiminalStyle` took a raw `surfaceLevel` number;
 * `resolveSurface` takes a role. They disagreed about the same depth — at level
 * 3 the old one drew a rim of 1, which the contract says belongs to chrome and
 * work, while the new one draws 2 — and a component could pick either. The old
 * one also carried a hard-coded ceiling (`Math.min(5, ...)`) that outlived the
 * ladder growing to nine steps, so S6, S7 and S8 were silently flattened onto
 * S5.
 *
 * A component now declares WHAT it is. The rule is the project's own: values
 * become tokens, **selections become names**, raw numbers are forbidden.
 */
describe('there is ONE surface resolver', () => {
  it('no file in src/ calls getLiminalStyle', () => {
    const offenders = FILES.filter((f) => code(f).includes('getLiminalStyle'));
    expect(offenders.map((f) => f.replace(SRC + '/', '')), 'the retired resolver').toEqual([]);
  });

  it('no component takes a surfaceLevel prop', () => {
    // A numeric prop is a selection the contract cannot check. `surface` names
    // the role instead.
    const offenders = FILES.filter((f) => /surfaceLevel\s*\?:/.test(code(f)));
    expect(offenders.map((f) => f.replace(SRC + '/', '')), 'a raw depth as a prop').toEqual([]);
  });

  it.skipIf(ZERO_ABSOLUTE)('the resolver is reachable, so the guard is not passing on an empty list', () => {
    // Skipped ONLY while src/components is empty by decision — see ./zero-state.
    const callers = FILES.filter((f) => code(f).includes('resolveSurface('));
    expect(callers.length).toBeGreaterThan(10);
  });
});
