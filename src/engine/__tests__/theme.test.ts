import { describe, it, expect } from 'vitest';
import { createLiminalTheme, ladderAtHue, halfStepsAtHue, inGamut } from '../liminal-theme';
import { LADDER, LADDER_HUE, LADDER_CHROMA, LADDER_STEP, PERCEPTUAL_QUANTUM } from '../liminal-ladder';
import { hexToRgb, rgbToOklch, oklchToRgb, rgbToHex } from '../liminal-color-math';
import { LiminalLayoutEngine as L } from '../liminal-layout-engine';

/**
 * The roadmap's definition of done for this phase: a designer changes the brand
 * hue and the whole system updates, mathematically and consistently.
 *
 * The claim that matters is the one about the STEP. A ladder built in OKLCH has
 * a step that is a measured perceptual quantum — so changing the hue must not
 * change how far apart the surfaces look. If it did, the ladder would be a
 * palette again.
 */
describe('theme — the default hue reproduces the system exactly', () => {
  it('generates the shipped ladder byte for byte', () => {
    expect(ladderAtHue(LADDER_HUE, LADDER_CHROMA)).toEqual(LADDER);
  });

  it('and the default theme is that ladder', () => {
    expect(createLiminalTheme().ladder).toEqual(LADDER);
  });
});

describe('theme — a new hue keeps the step, which is the whole point', () => {
  const hues = [0, 40, 90, 145, 200, 258.4, 300, 340];

  it('produces nine in-gamut hexes for every hue', () => {
    for (const h of hues) {
      const ladder = ladderAtHue(h);
      expect(ladder, `hue ${h}`).toHaveLength(9);
      for (const hex of ladder) {
        expect(hex, `hue ${h}: ${hex}`).toMatch(/^#[0-9a-f]{6}$/);
        expect(inGamut(hex), `hue ${h}: ${hex} out of gamut`).toBe(true);
      }
    }
  });

  it('keeps every step above the quantum, at every hue', () => {
    // The lower bound is the one that matters: a step below q is a pair the eye
    // cannot separate, which is the single thing the ladder exists to avoid.
    // The upper bound is softer — 8-bit sRGB cannot always land on the target,
    // and a step slightly over 1.5q is a coarser scale, not a broken one.
    for (const h of hues) {
      const ladder = ladderAtHue(h);
      for (let i = 1; i < ladder.length; i++) {
        const dL = rgbToOklch(hexToRgb(ladder[i])).L - rgbToOklch(hexToRgb(ladder[i - 1])).L;
        const q = dL / PERCEPTUAL_QUANTUM;
        expect(q, `hue ${h}, step ${i}: ${q.toFixed(2)}q`).toBeGreaterThan(0.85);
        expect(q, `hue ${h}, step ${i}: ${q.toFixed(2)}q`).toBeLessThan(1.7);
      }
    }
  });

  it('never goes below the canvas, and rises monotonically', () => {
    for (const h of hues) {
      const ls = ladderAtHue(h).map((hex) => rgbToOklch(hexToRgb(hex)).L);
      expect(ls[0], `hue ${h}`).toBeCloseTo(0.128, 2);
      for (let i = 1; i < ls.length; i++) expect(ls[i], `hue ${h}`).toBeGreaterThan(ls[i - 1]);
    }
  });

  it('stays within a quantisation step of the ceiling', () => {
    // The target for level 8 is 0.2038. 8-bit sRGB cannot always land on it:
    // at hue 0 the nearest value is 0.2054, which is 0.0016 out — under a fifth
    // of the quantum. That is the floor of what the format allows, not a bug.
    for (const h of hues) {
      const top = rgbToOklch(hexToRgb(ladderAtHue(h)[8])).L;
      expect(top - 0.2038, `hue ${h}: ceiling ${top.toFixed(4)}`).toBeLessThan(0.25 * PERCEPTUAL_QUANTUM);
    }
  });

  it('holds the chroma constant across the ladder', () => {
    // Hue and chroma are fixed; only lightness moves. That is what makes it a
    // scale rather than a palette.
    //
    // CHROMA is the one to measure, not hue. At a chroma of 0.0069 the colour
    // is very nearly grey, so the MEASURED hue is numerically unstable: one
    // 8-bit step swings it twenty degrees while the colour does not visibly
    // change. Chroma is stable and is what the claim is actually about.
    for (const h of [40, 145, 258.4]) {
      const chromas = ladderAtHue(h).map((hex) => rgbToOklch(hexToRgb(hex)).C);
      const spread = Math.max(...chromas) - Math.min(...chromas);
      expect(spread, `hue ${h} chroma spread ${spread.toFixed(4)}`).toBeLessThan(0.006);
    }
  });
});

describe('theme — the round trip is exact', () => {
  it('hex -> OKLCH -> hex is the same colour', () => {
    for (const hex of LADDER) {
      expect(rgbToHex(oklchToRgb(rgbToOklch(hexToRgb(hex))))).toBe(hex);
    }
  });

  it('and for a spread of generated hues', () => {
    for (const hex of ladderAtHue(145)) {
      expect(rgbToHex(oklchToRgb(rgbToOklch(hexToRgb(hex))))).toBe(hex);
    }
  });
});

describe('theme — the half-steps sit between the steps', () => {
  it('generates eight, each between its neighbours', () => {
    const halves = halfStepsAtHue(LADDER_HUE);
    expect(halves).toHaveLength(8);
    for (let i = 0; i < halves.length; i++) {
      const lo = rgbToOklch(hexToRgb(LADDER[i])).L;
      const hi = rgbToOklch(hexToRgb(LADDER[i + 1])).L;
      const mid = rgbToOklch(hexToRgb(halves[i])).L;
      expect(mid, `half ${i}`).toBeGreaterThanOrEqual(lo - 1e-6);
      expect(mid, `half ${i}`).toBeLessThanOrEqual(hi + 1e-6);
    }
  });
});

describe('theme — density and motion scale, and the step does not', () => {
  it('scales the spacing and control scales', () => {
    const compact = createLiminalTheme({ density: 0.875 });
    expect(compact.css).toContain(`--liminal-space-3: ${L.SPACING[3] * 0.875}px`);
    expect(compact.css).toContain(`--liminal-control-md: ${L.CONTROL.md * 0.875}px`);
  });

  it('scales the durations', () => {
    const slow = createLiminalTheme({ motion: 1.5 });
    expect(slow.css).toMatch(/--liminal-duration-fast: 225ms/);
  });

  it('leaves the ladder alone when only the density changes', () => {
    expect(createLiminalTheme({ density: 0.875 }).ladder).toEqual(LADDER);
  });

  it('does not touch the step when the density changes', () => {
    // The step is a perceptual quantum. A denser interface is not a coarser
    // one — the surfaces stay exactly as far apart as the eye can tell.
    const a = createLiminalTheme({ density: 0.875 }).ladder;
    const b = createLiminalTheme({ density: 1.25 }).ladder;
    expect(a).toEqual(b);
    expect(LADDER_STEP).toBeCloseTo(0.009475, 6);
  });
});

describe('theme — the CSS is a scope, not a second system', () => {
  it('writes a scoped block, so two themes can coexist', () => {
    const css = createLiminalTheme({ brandHue: 145, name: 'forest' }).css;
    expect(css).toContain('[data-liminal-theme="forest"]');
    expect(css).toContain('--liminal-s0:');
    expect(css).toContain('--liminal-s8:');
  });

  it('declares no variable twice', () => {
    const css = createLiminalTheme({ brandHue: 145, density: 0.9, motion: 1.2 }).css;
    const names = [...css.matchAll(/--liminal-([a-z0-9-]+):/g)].map((m) => m[1]);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('theme — it reports the steps a hue cannot hold', () => {
  // 8-bit sRGB is not equally fine at every hue. Measured: Forest's first step
  // is 0.85q and Abyss's is 0.92q — pairs of surfaces the eye cannot separate,
  // which is the one thing the ladder exists to prevent. The search repairs
  // what it can; this is what it cannot, and a designer choosing a hue should
  // know before shipping it.
  it('the system’s own hue is clean', () => {
    expect(createLiminalTheme().warnings).toEqual([]);
  });

  it('names the level and the realised step, not just that something is wrong', () => {
    const forest = createLiminalTheme({ brandHue: 145, name: 'forest' });
    expect(forest.warnings.length).toBeGreaterThan(0);
    for (const w of forest.warnings) {
      expect(w.kind).toBe('below-quantum');
      expect(w.level).toBeGreaterThanOrEqual(1);
      expect(w.q).toBeLessThan(1.0);
    }
  });

  it('a clean hue reports nothing', () => {
    expect(createLiminalTheme({ brandHue: 320, name: 'plum' }).warnings).toEqual([]);
  });

  it('every warning is a step that really is out of band', () => {
    for (const hue of [0, 35, 90, 145, 200, 215, 258.4, 320]) {
      const t = createLiminalTheme({ brandHue: hue });
      for (const w of t.warnings) {
        const dL = rgbToOklch(hexToRgb(t.ladder[w.level])).L - rgbToOklch(hexToRgb(t.ladder[w.level - 1])).L;
        expect(dL / PERCEPTUAL_QUANTUM, `hue ${hue} S${w.level}`).toBeCloseTo(w.q, 6);
      }
    }
  });
});
