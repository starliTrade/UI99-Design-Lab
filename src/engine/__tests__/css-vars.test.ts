import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {
  generateCssVars,
  generateDarkScope,
  CSS_VARS_START,
  CSS_VARS_END,
} from '../liminal-css-vars';
import { LADDER, TEXT_HIERARCHY, SURFACE_TINT, VEIL, SHADOWS, Z_INDEX } from '../spec-engine';
import { LiminalLayoutEngine } from '../liminal-layout-engine';
import { LiminalMotionEngine } from '../liminal-motion-engine';
import { LiminalColorEngine } from '../liminal-color-engine';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '../../index.css'), 'utf8');

/**
 * The CSS variable layer is generated from the engine. These tests prove the
 * committed index.css matches the generator, so the two cannot drift — the
 * hand-written block covered ~19 of ~90 tokens and nothing caught it.
 */
describe('CSS variable layer — generated, complete, in sync', () => {
  it('index.css carries the generated block verbatim', () => {
    expect(css).toContain(generateCssVars().trimEnd());
    expect(css).toContain(generateDarkScope().trimEnd());
  });

  it('is wrapped in the generated markers', () => {
    expect(css).toContain(CSS_VARS_START);
    expect(css).toContain(CSS_VARS_END);
    expect(css.indexOf(CSS_VARS_START)).toBeLessThan(css.indexOf(CSS_VARS_END));
  });

  it('exposes every ladder step and both sub-canvas wells', () => {
    LADDER.forEach((hex, i) => expect(css).toContain(`--liminal-s${i}: ${hex};`));
    expect(css).toContain('--liminal-s-minus-1: #030406;');
    expect(css).toContain('--liminal-s-minus-2: #010203;');
  });

  it('exposes every rim level', () => {
    for (const level of [1, 2, 3]) {
      for (const edge of ['top', 'side', 'bottom']) {
        expect(css, `rim ${level} ${edge} missing`).toContain(`--liminal-rim-${level}-${edge}: #`);
      }
    }
  });

  it('exposes every shadow', () => {
    Object.entries(SHADOWS).forEach(([k, val]) =>
      expect(css).toContain(`--liminal-shadow-e${k}: ${val};`),
    );
  });

  it('exposes every surface tint and veil', () => {
    Object.entries(SURFACE_TINT).forEach(([k, val]) =>
      expect(css).toContain(`--liminal-tint-${k}: ${val};`),
    );
    Object.entries(VEIL).forEach(([k, val]) => expect(css).toContain(`--liminal-veil-${k}: ${val};`));
  });

  it('exposes the text hierarchy', () => {
    expect(css).toContain(`--liminal-text-primary: rgba(255, 255, 255, ${TEXT_HIERARCHY.primary});`);
    expect(css).toContain(
      `--liminal-text-tertiary: rgba(255, 255, 255, ${TEXT_HIERARCHY.tertiary[0]});`,
    );
  });

  it('exposes all five facets of every semantic role', () => {
    for (const role of ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const) {
      const key = role.toLowerCase();
      for (const facet of ['', '-text', '-subtle', '-border', '-on']) {
        expect(css, `--liminal-${key}${facet} missing`).toContain(`--liminal-${key}${facet}:`);
      }
    }
  });

  it('exposes the brand including its hover, active and subtle states', () => {
    for (const name of ['brand', 'brand-on', 'brand-hover', 'brand-active', 'brand-subtle']) {
      expect(css, `${name} missing`).toContain(`--liminal-${name}:`);
    }
  });

  it('exposes the full 12-hue extended spectrum', () => {
    expect(LiminalColorEngine.EXTENDED_SPECTRUM).toHaveLength(12);
    LiminalColorEngine.EXTENDED_SPECTRUM.forEach((h) =>
      expect(css, `hue ${h.hue} missing`).toContain(`--liminal-hue-${h.hue}: ${h.hex};`),
    );
  });

  it('exposes spacing, radius, type and motion — the whole surface', () => {
    Object.entries(LiminalLayoutEngine.SPACING).forEach(([k, val]) =>
      expect(css).toContain(`--liminal-space-${k}: ${val}px;`),
    );
    for (const role of ['chip', 'control', 'card', 'panel', 'container', 'full'] as const) {
      expect(css).toContain(`--liminal-radius-${role}:`);
    }
    Object.entries(LiminalMotionEngine.DURATION).forEach(([k, val]) =>
      expect(css).toContain(`--liminal-duration-${k}: ${val}ms;`),
    );
    Object.entries(LiminalMotionEngine.EASING).forEach(([k, val]) =>
      expect(css).toContain(`--liminal-ease-${k}: ${val};`),
    );
    Object.entries(Z_INDEX).forEach(([k, val]) => expect(css).toContain(`--liminal-z-${k}: ${val};`));
  });

  it('covers the whole token surface, not a subset', () => {
    // The hand-written layer had 19 variables. Anything near that is a regression.
    const count = (css.match(/--liminal-/g) || []).length;
    expect(count, `only ${count} variable references found`).toBeGreaterThan(200);
  });
});
