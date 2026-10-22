import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mistCssVars, mistFloatShadow, FLOATING_MIST_ROLES } from '../liminal-mist';
import { floatingShadow, FLOAT_SHADOWS, FLOATING_ROLES, FLOAT_HOST } from '../liminal-surface';

/**
 * Roadmap 2.4 — the mist and the floating shadow are ONE formula.
 *
 * Three guards, each able to fail on its own:
 *   1. the value the mist publishes IS the engine's floating shadow, character for character;
 *   2. the stylesheet uses that one variable and does not re-assemble the layers;
 *   3. the mist's roles are exactly the engine's floating roles, so nothing floats
 *      under one formula and is drawn under another.
 */
const css = readFileSync(resolve(process.cwd(), 'src/engine/liminal-mist.css'), 'utf8');
const mistBlock = css.match(/\[data-liminal-mist\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

describe('the mist casts the engine’s floating shadow (2.4)', () => {
  it('the mist block was found, so the checks below are not vacuous', () => {
    expect(mistBlock.length).toBeGreaterThan(0);
    expect(mistBlock).toContain('box-shadow');
  });

  it('every mist role publishes exactly the engine’s floating shadow', () => {
    for (const role of FLOATING_MIST_ROLES) {
      // The host is the one-step host (FLOAT_HOST), not the work plane: see float-host.test.ts.
      expect(mistCssVars(role)['--liminal-mist-float-shadow'], role).toBe(floatingShadow(role, FLOAT_HOST[role as keyof typeof FLOAT_HOST]));
      expect(mistFloatShadow(role), role).toBe(floatingShadow(role, FLOAT_HOST[role as keyof typeof FLOAT_HOST]));
    }
  });

  it('the stylesheet consumes that one variable, and no longer re-assembles the layers', () => {
    const shadow = mistBlock.match(/box-shadow:\s*([\s\S]*?);/)?.[1] ?? '';
    expect(shadow).toContain('var(--liminal-mist-float-shadow)');
    expect(shadow, 'no second copy of the near/far layers').not.toMatch(/--liminal-mist-shadow-(near|far)/);
  });

  it('the mist roles are exactly the engine’s floating roles', () => {
    expect([...FLOATING_MIST_ROLES].sort()).toEqual([...FLOATING_ROLES].sort());
  });

  it('the engine’s own table agrees with the single function', () => {
    for (const role of FLOATING_ROLES) {
      expect(FLOAT_SHADOWS[role], role).toBe(floatingShadow(role));
    }
  });
});
