import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LADDER, getTextStyle } from '../spec-engine';
import { LiminalLayoutEngine as L } from '../liminal-layout-engine';
import { LiminalColorEngine as C } from '../liminal-color-engine';
import { PERSIAN_FONT_STACK } from '../liminal-persian';

const css = readFileSync(resolve(process.cwd(), 'src/engine/liminal-tailwind.css'), 'utf8');
const index = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

/**
 * Tailwind v4 reads its theme from CSS, so the bridge is a `@theme` block
 * rather than a JavaScript preset. Every value comes from the engine — the same
 * source `index.css` and the DTCG file read.
 *
 * The point is not to give Tailwind its own copy of the tokens. It is to let a
 * consumer write `bg-liminal-s3` and get the same surface the engine resolves,
 * from the same number.
 */
describe('tailwind — the bridge is the engine, not a second copy', () => {
  it('is imported after Tailwind itself, so the theme block is registered', () => {
    const tw = index.indexOf('@import "tailwindcss"');
    const bridge = index.indexOf('liminal-tailwind.css');
    expect(tw).toBeGreaterThan(-1);
    expect(bridge).toBeGreaterThan(tw);
  });

  it('declares a @theme block', () => {
    expect(css).toContain('@theme {');
  });

  it('maps every ladder step, by number and by role name', () => {
    LADDER.forEach((hex, i) => {
      expect(css, `step ${i}`).toContain(`--color-liminal-s${i}: ${hex};`);
    });
    ['canvas', 'chrome', 'work', 'panel', 'control', 'floating', 'popover', 'modal', 'ceiling'].forEach((role, i) => {
      expect(css, role).toContain(`--color-liminal-${role}: ${LADDER[i]};`);
    });
  });

  it('maps the text roles with the engine’s derived alpha', () => {
    for (const role of ['primary', 'secondary', 'tertiary', 'quaternary'] as const) {
      expect(css, role).toContain(`--color-liminal-text-${role}: ${getTextStyle(role, 2).color};`);
    }
  });

  it('maps the semantic roles', () => {
    for (const k of ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const) {
      const s = (C.SEMANTICS as any)[k];
      expect(css, k).toContain(`--color-liminal-${k.toLowerCase()}: ${s.solid};`);
    }
  });

  it('maps the spacing scale, including the sub-atom', () => {
    Object.entries(L.SPACING).forEach(([k, v]) => expect(css, `spacing ${k}`).toContain(`--spacing-liminal-${k}: ${v}px;`));
  });

  it('maps the radius scale', () => {
    Object.entries(L.RADIUS).forEach(([k, v]) => expect(css, `radius ${k}`).toContain(`--radius-liminal-${k}: ${v}px;`));
  });

  it('maps the type scale as a fluid var, not a px', () => {
    // A static px in a Tailwind utility would ignore the reader's browser
    // font-size setting, which is the whole reason the scale is fluid.
    for (const lvl of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(css, `level ${lvl}`).toContain(`--text-liminal-${lvl}: ${L.getTypeSizeCss(lvl)};`);
      expect(css, `level ${lvl}`).not.toContain(`--text-liminal-${lvl}: ${L.TYPOGRAPHY[lvl].fs}px;`);
    }
  });

  it('carries the line-height, tracking and weight with each size', () => {
    for (const lvl of [1, 4, 8]) {
      expect(css).toContain(`--text-liminal-${lvl}--line-height: ${L.TYPOGRAPHY[lvl].lh};`);
      expect(css).toContain(`--text-liminal-${lvl}--letter-spacing: ${L.TYPOGRAPHY[lvl].ls};`);
      expect(css).toContain(`--text-liminal-${lvl}--font-weight: ${L.TYPOGRAPHY[lvl].weight};`);
    }
  });

  it('carries both font stacks', () => {
    expect(css).toContain('--font-liminal:');
    expect(css).toContain(`--font-liminal-fa: ${PERSIAN_FONT_STACK};`);
  });

  it('declares no variable twice', () => {
    const names = [...css.matchAll(/^\s+(--[a-z0-9-]+):/gm)].map((m) => m[1]);
    expect(new Set(names).size).toBe(names.length);
  });
});
