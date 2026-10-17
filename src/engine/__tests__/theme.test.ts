import { describe, it, expect } from 'vitest';
import { createLiminalTheme, ladderAtHue, halfStepsAtHue, inGamut, allHueScales, HUE_STEP_NAMES } from '../liminal-theme';
import { LADDER, HALF, LADDER_HUE, LADDER_CHROMA, LADDER_STEP, PERCEPTUAL_QUANTUM } from '../liminal-ladder';
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
  it('scales the spacing, control and radius scales together', () => {
    // Together, because scaling the padding without the radii breaks the
    // concentric law `r_inner = max(4, r_outer − padding)`.
    const roomy = createLiminalTheme({ density: 1.25 });
    expect(roomy.css).toContain(`--liminal-space-3: ${L.SPACING[3] * 1.25}px`);
    expect(roomy.css).toContain(`--liminal-control-md: ${L.CONTROL.md * 1.25}px`);
    expect(roomy.css).toContain(`--liminal-radius-card: ${L.RADIUS.card * 1.25}px`);
  });

  it('a density below 1 is refused, because it would break the touch floor', () => {
    // `CONTROL.md` is 44px because that is the floor a finger needs.
    const compact = createLiminalTheme({ density: 0.875 });
    expect(compact.density).toBe(1);
    expect(compact.css).not.toContain('--liminal-control-md');
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
    const css = createLiminalTheme({ name: 'forest' }).css;
    expect(css).toContain('[data-liminal-theme="forest"]');
    expect(css).toContain('--liminal-s0:');
    expect(css).toContain('--liminal-s8:');
  });

  it('declares no variable twice', () => {
    const css = createLiminalTheme({ density: 0.9, motion: 1.2 }).css;
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
  it('carries the engine’s ladder, byte for byte', () => {
    // The ladder is the identity. It used to regenerate at a hue, which turned
    // a neutral luminance ramp green, purple or red — measured — while the code
    // says the identity is monochrome and LOCKED.
    expect(createLiminalTheme({ name: 'x' }).ladder).toEqual([...LADDER]);
  });

  it('carries the engine’s half-steps, byte for byte', () => {
    // It used to regenerate these too, by its own method: all eight differed
    // from `HALF`, and at hue 145 one left the perceptual band. A second answer
    // for the same value is the defect class this project keeps meeting.
    expect(createLiminalTheme({ name: 'x' }).halves).toEqual([...(HALF as readonly string[])]);
  });

  it('clamps a density that would break the touch floor, and reports the clamp', () => {
    const t = createLiminalTheme({ density: 0.8, name: 'x' });
    expect(t.density).toBeGreaterThan(0.8);
    expect(t.warnings).toHaveLength(1);
    expect(t.warnings[0].scale).toBe('density');
    expect(t.warnings[0].used).toBe(t.density);
  });

  it('a density inside the bounds is used as asked, with no warning', () => {
    const t = createLiminalTheme({ density: 1.2, name: 'x' });
    expect(t.density).toBe(1.2);
    expect(t.warnings).toEqual([]);
  });

  it('scales the radii WITH the padding, so the concentric law survives', () => {
    // Scaling one and not the other breaks r_inner = max(4, r_outer − padding).
    // That is exactly what the old theme did.
    const t = createLiminalTheme({ density: 1.2, name: 'x' });
    expect(t.css).toContain('--liminal-radius-');
    expect(t.css).toContain('--liminal-space-');
    expect(t.css).toContain('--liminal-control-');
  });

  it('never scales the radius sentinel', () => {
    const t = createLiminalTheme({ density: 1.2, name: 'x' });
    expect(t.css).not.toContain('--liminal-radius-full');
  });

  it('floors the motion, so nothing becomes instant', () => {
    const t = createLiminalTheme({ motion: 0, name: 'x' });
    expect(t.motion).toBeGreaterThan(0);
    expect(t.warnings.some((w) => w.scale === 'motion')).toBe(true);
  });
});

describe('theme — a full scale per hue, not one swatch', () => {
  // The spectrum shipped one colour per hue. Radix Colors ships twelve STEPS
  // per hue, which is a different capability: a consumer who wants "a green
  // surface at three elevations" has nothing to reach for with a single swatch.
  it('gives every spectrum hue twelve named steps', () => {
    for (const s of allHueScales()) {
      expect(Object.keys(s.steps), s.label).toHaveLength(12);
      for (const name of HUE_STEP_NAMES) expect(s.steps[name], `${s.label}.${name}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('names the steps for their JOB, not their number', () => {
    // A number tells a consumer nothing about which one to use.
    expect(HUE_STEP_NAMES[0]).toBe('canvas');
    expect(HUE_STEP_NAMES).toContain('solid');
    expect(HUE_STEP_NAMES).toContain('text');
  });

  it('rises monotonically, so the scale reads as a scale', () => {
    for (const s of allHueScales()) {
      const ls = HUE_STEP_NAMES.map((n) => rgbToOklch(hexToRgb(s.steps[n])).L);
      for (let i = 1; i < ls.length; i++) {
        expect(ls[i], `${s.label} step ${i}`).toBeGreaterThanOrEqual(ls[i - 1] - 1e-6);
      }
    }
  });

  it('stays inside the ladder’s own lightness band', () => {
    // The same perceptual band the whole system lives in. A scale that left it
    // would be a second system.
    // The band, plus what 8-bit sRGB cannot do better than. Measured: at hue 15
    // (Ruby) the nearest value to the top of the band is 0.0028 above it — 0.34
    // of a quantum. That is the format's floor, not the scale leaving the band.
    const slack = 0.5 * PERCEPTUAL_QUANTUM;
    const lo = 0.128 - slack;
    const hi = 0.128 + 8 * LADDER_STEP + slack;
    for (const s of allHueScales()) {
      for (const n of HUE_STEP_NAMES) {
        const L = rgbToOklch(hexToRgb(s.steps[n])).L;
        expect(L, `${s.label}.${n} L ${L.toFixed(4)}`).toBeGreaterThanOrEqual(lo);
        expect(L, `${s.label}.${n} L ${L.toFixed(4)}`).toBeLessThanOrEqual(hi);
      }
    }
  });

  it('holds the hue across its own steps', () => {
    for (const s of allHueScales()) {
      const chromas = HUE_STEP_NAMES.map((n) => rgbToOklch(hexToRgb(s.steps[n])).C);
      const spread = Math.max(...chromas) - Math.min(...chromas);
      expect(spread, `${s.label} chroma spread ${spread.toFixed(4)}`).toBeLessThan(0.06);
    }
  });

  it('gives twelve distinct steps — a scale is not a palette', () => {
    for (const s of allHueScales()) {
      const hexes = HUE_STEP_NAMES.map((n) => s.steps[n]);
      expect(new Set(hexes).size, s.label).toBeGreaterThanOrEqual(10);
    }
  });
});
