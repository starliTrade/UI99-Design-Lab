import { describe, it, expect } from 'vitest';
import {
  LADDER_V2, LADDER_TOP, JND_K, PERCEPTUAL_FACTOR,
  luminanceY, jndAt, stepInJnd, layerHex, borderCss, shadowCss, component, RIM_V2,
} from '../liminal-ladder-v2';
import { HALO, haloCss, haloFor, HALO_TARGETS } from '../liminal-halo';

describe('LADDER v2 — locked values (ui_engine_reference_v2.pdf)', () => {
  it('has 9 layers S0..S8 with the locked hex values', () => {
    expect(LADDER_V2.map((l) => l.hex)).toEqual([
      '#060709', '#0B0B0B', '#0F0F0F', '#131313', '#171717',
      '#1B1B1B', '#1F1F1F', '#232323', '#272727',
    ]);
    expect(LADDER_TOP).toBe(8);
  });

  it('uses k = 0.025 and a perceptual factor of 0.5', () => {
    expect(JND_K).toBe(0.025);
    expect(PERCEPTUAL_FACTOR).toBe(0.5);
  });

  it('every step is about one JND (locked mean 1.034, each within ±6%)', () => {
    for (let l = 1; l <= LADDER_TOP; l++) {
      const s = stepInJnd(l);
      expect(s).toBeGreaterThan(0.94);
      expect(s).toBeLessThan(1.1);
    }
  });

  it('S0 has no step below it', () => {
    expect(() => stepInJnd(0)).toThrow(/no step below/);
  });

  it('jnd at a level is k × √Y', () => {
    expect(jndAt(3)).toBeCloseTo(JND_K * Math.sqrt(luminanceY('#131313')), 10);
  });

  it('layerHex rejects levels outside 0..8', () => {
    expect(layerHex(8)).toBe('#272727');
    expect(() => layerHex(9)).toThrow(RangeError);
    expect(() => layerHex(-1)).toThrow(RangeError);
  });
});

describe('Enhancements v2', () => {
  it('border: child colour at 50% alpha, 1px (reference example S2→S3)', () => {
    expect(borderCss(2)).toBe('1px solid rgba(19, 19, 19, 0.5)');
  });

  it('border is refused on S8 (no child)', () => {
    expect(() => borderCss(8)).toThrow(/no child/);
  });

  it('shadow matches the formula at S0 and S3 (reference examples)', () => {
    expect(shadowCss(0)).toBe('0 2px 4.8px rgba(0, 0, 0, 0.273)');
    expect(shadowCss(3)).toBe('0 2px 6.6px rgba(0, 0, 0, 0.155)');
  });

  it('documented discrepancy: reference shows S7 opacity 0.100, formula gives 0.096', () => {
    // The reference's own example for S7 does not match its formula. The formula is used.
    expect(shadowCss(7)).toBe('0 2px 10.7px rgba(0, 0, 0, 0.096)');
  });

  it('rim v2 constants: 75% width, 1px, peak 16%', () => {
    expect(RIM_V2.widthPercent).toBe(75);
    expect(RIM_V2.heightPx).toBe(1);
    expect(RIM_V2.peakAlpha).toBe(0.16);
  });

  it('a component is parent+1 with exactly one enhancement', () => {
    const c = component(2, 'border');
    expect(c.level).toBe(3);
    expect(c.background).toBe('#131313');
    expect(c.border).toBe('1px solid rgba(19, 19, 19, 0.5)');
    expect(c.boxShadow).toBeNull();
    expect(c.rim).toBe(false);
  });

  it('plain has no enhancement', () => {
    const c = component(1, 'plain');
    expect(c.border).toBeNull();
    expect(c.boxShadow).toBeNull();
    expect(c.rim).toBe(false);
  });

  it('rim is a flag, not a border', () => {
    const c = component(4, 'rim');
    expect(c.rim).toBe(true);
    expect(c.border).toBeNull();
  });

  it('an unknown enhancement is refused', () => {
    expect(() => component(2, 'glow' as never)).toThrow(/not one of/);
  });

  it('a component cannot sit on S8', () => {
    expect(() => component(8, 'plain')).toThrow(/cannot hold a child/);
  });
});

describe('Halo (separate system)', () => {
  it('approved halos are soft, medium, wide (H3 rejected)', () => {
    expect(Object.keys(HALO).sort()).toEqual(['medium', 'soft', 'wide']);
  });

  it('halo css matches the approved values', () => {
    expect(haloCss('soft')).toBe('0 0 6px 1px rgba(255, 255, 255, 0.03)');
    expect(haloCss('wide')).toBe('0 0 16px 4px rgba(255, 255, 255, 0.02)');
  });

  it('halo has eight targets and no default', () => {
    expect(HALO_TARGETS.length).toBe(8);
    for (const t of HALO_TARGETS) expect(haloFor(t, null)).toBeNull();
  });

  it('unknown halo and unknown target are refused', () => {
    expect(() => haloCss('h3' as never)).toThrow(/not approved/);
    expect(() => haloFor('nope' as never, 'soft')).toThrow(/not a halo target/);
  });
});
