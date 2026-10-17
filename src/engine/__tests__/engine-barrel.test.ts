import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * THE BARREL MUST EXPORT EVERY MODULE.
 *
 * It did not. Fourteen were absent, including `liminal-surface` — the resolver
 * every component calls — and `liminal-ladder`, `liminal-theme`,
 * `liminal-direction` and `liminal-contrast`. Inside the repo that is invisible,
 * because a component imports by path. For a library it is the whole question:
 * a consumer who cannot import `resolveSurface` cannot build on the engine.
 */
const ENGINE = resolve(__dirname, '..');
const BARREL = readFileSync(join(ENGINE, 'index.ts'), 'utf8');

describe('the engine barrel', () => {
  it('exports every module in the directory', () => {
    const modules = readdirSync(ENGINE)
      .filter((f) => /\.tsx?$/.test(f) && f !== 'index.ts' && !f.endsWith('.d.ts'))
      .map((f) => f.replace(/\.tsx?$/, ''));
    const missing = modules.filter((m) => !BARREL.includes(`'./${m}'`));
    expect(missing, 'a module a consumer cannot reach').toEqual([]);
  });

  it('found modules to check — a guard that passes on an empty list is not a guard', () => {
    const modules = readdirSync(ENGINE).filter((f) => /\.tsx?$/.test(f) && f !== 'index.ts');
    expect(modules.length).toBeGreaterThan(20);
  });

  it('reaches the resolver every component calls', () => {
    expect(BARREL).toContain("'./liminal-surface'");
    expect(BARREL).toContain("'./liminal-ladder'");
  });
});
