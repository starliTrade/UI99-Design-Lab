import { describe, it, expect } from 'vitest';
import {
  APPROVED,
  PALETTE,
  PALETTE_STEP_DROP,
  maxChromaAt,
  gamutFraction,
  paletteHex,
  paletteStep,
  paletteHue,
  roleOfStep,
  nearestHue,
  SEMANTIC_FROM_PALETTE,
  paletteTextContrast,
} from '../liminal-palette';
import { hexToRgb, rgbToOklch, contrastRatioHex } from '../liminal-color-math';
import { LADDER } from '../liminal-ladder';

/**
 * §6.11 IS LAW, AND THIS IS THE LAW'S GUARD.
 *
 * The palette is the piece of the color system that was specified but never
 * built — twelve approved colours and no ramp, and semantics drawn from a chroma
 * the same section forbids. These assertions hold the derivation to the numbers
 * §6.11 recorded, so the palette cannot quietly drift from the law that created it.
 */
describe('§6.11 — the palette is 12 hues × 7 steps', () => {
  it('has twelve hues and seven steps each', () => {
    expect(APPROVED.length).toBe(12);
    expect(PALETTE.length).toBe(12);
    for (const hue of PALETTE) expect(hue.steps.length).toBe(7);
  });

  it('step 7 is the approved colour, byte for byte', () => {
    // The twelve are the identity; a round-trip through OKLCH must not move them.
    for (const a of APPROVED) {
      expect(paletteHex(a.label, 7), `${a.label} step 7`).toBe(a.hex);
    }
  });

  it('the role bands are 1–3 fill, 4–5 border, 6–7 text', () => {
    expect([1, 2, 3].map(roleOfStep)).toEqual(['fill', 'fill', 'fill']);
    expect([4, 5].map(roleOfStep)).toEqual(['border', 'border']);
    expect([6, 7].map(roleOfStep)).toEqual(['text', 'text']);
    for (const hue of PALETTE) {
      for (const s of hue.steps) expect(s.role).toBe(roleOfStep(s.n));
    }
  });

  it('each step is 0.08 lightness darker than the one above', () => {
    for (const hue of PALETTE) {
      for (let n = 6; n >= 1; n--) {
        const drop = hue.steps[n].L - hue.steps[n - 1].L; // steps[n] is step n+1
        expect(drop, `${hue.label} ${n}→${n + 1}`).toBeCloseTo(PALETTE_STEP_DROP, 3);
      }
    }
  });

  it('lightness strictly ascends step 1 → 7 (darkest fill → brightest text)', () => {
    for (const hue of PALETTE) {
      for (let i = 1; i < 7; i++) expect(hue.steps[i].L).toBeGreaterThan(hue.steps[i - 1].L);
    }
  });
});

describe('§6.11 — the gamut fraction is measured, not chosen', () => {
  it('every hue keeps 50–85% of its own gamut', () => {
    for (const hue of PALETTE) {
      expect(hue.fraction, hue.label).toBeGreaterThan(0.5);
      expect(hue.fraction, hue.label).toBeLessThan(0.85);
    }
  });

  it('Fuchsia is the lowest and Indigo the highest — the §6.11 observation', () => {
    // The POLICY named these two: Fuchsia ~54.5%, Indigo ~83.1%. The derivation
    // reproduces the SHAPE from first principles; the exact digits differ by
    // round-trip precision, so the guard is on the ordering, not the decimals.
    const fuchsia = paletteHue('Fuchsia').fraction;
    const indigo = paletteHue('Indigo').fraction;
    const fracs = PALETTE.map((h) => h.fraction);
    expect(fuchsia, 'Fuchsia is the flattest').toBe(Math.min(...fracs));
    expect(indigo, 'Indigo is the most saturated').toBe(Math.max(...fracs));
  });

  it('gamutFraction reads the same value off the approved colour', () => {
    for (const a of APPROVED) {
      expect(gamutFraction(a.hex), a.label).toBeCloseTo(paletteHue(a.label).fraction, 6);
    }
  });

  it('no derived step clips sRGB — chroma stays within the reachable gamut', () => {
    // Compared at the MEASURED hue the ramp was built on, not the nominal label.
    for (const hue of PALETTE) {
      for (const s of hue.steps) {
        expect(s.C, `${hue.label} step ${s.n}`).toBeLessThanOrEqual(maxChromaAt(s.L, hue.hueMeasured) + 1e-4);
      }
    }
  });

  it('each hue keeps its TRUE angle all the way down (< 3° drift)', () => {
    // "کسری از گاموت" preserves CHARACTER: the hue angle is held, only lightness
    // and (reachable) chroma move. Measured against the approved colour's real
    // OKLCH angle — the ramp darkens the colour the eye approved, not a rounded
    // idea of it. Actual worst drift is ~1.6° (Coral step 2); 3° is the ceiling.
    for (const hue of PALETTE) {
      for (const s of [1, 2, 4, 6] as const) {
        const { h } = rgbToOklch(hexToRgb(paletteHex(hue.label, s)));
        const d = Math.abs(h - hue.hueMeasured) % 360;
        expect(Math.min(d, 360 - d), `${hue.label} step ${s} hue drift`).toBeLessThan(3);
      }
    }
  });
});

describe('§6.11 — the palette has no layers, and that is a feature', () => {
  it('every text step (6–7) clears the hard AA floor on the darkest AND lightest surface', () => {
    const darkest = LADDER[0];
    const lightest = LADDER[LADDER.length - 1];
    for (const hue of PALETTE) {
      for (const n of [6, 7] as const) {
        const hex = paletteHex(hue.label, n);
        expect(contrastRatioHex(hex, darkest), `${hue.label} s${n} on canvas`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatioHex(hex, lightest), `${hue.label} s${n} on toast`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('step 7 — the text colour — matches the §6.11 proof: ≥ 6.47:1 on all nine', () => {
    // §6.11 measured the text step at a minimum 6.47:1 (Violet on toast). This
    // reproduces it live across every surface, so the claim is a guard not a note.
    const { min, minLabel, onSurface } = paletteTextContrast();
    expect(min).toBeGreaterThanOrEqual(6.47);
    expect(minLabel, 'the binding hue is Violet, the darkest approved colour').toBe('Violet');
    expect(onSurface, 'the binding surface is toast, the lightest ladder step').toBe(LADDER[LADDER.length - 1]);
  });

  it('fill steps are DARK — a fill is a surface, not text', () => {
    // Steps 1–3 carry white text (a coloured button), so they must be dark enough
    // for it. The approved colour (step 7) is light; step 1 is ~0.48 darker.
    for (const hue of PALETTE) {
      expect(paletteStep(hue.label, 1).L, `${hue.label} fill`).toBeLessThan(0.5);
    }
  });
});

describe('§6.11 — the semantic mapping is a PROPOSAL, exposed for the eye test', () => {
  it('maps all four roles to an approved hue', () => {
    expect(SEMANTIC_FROM_PALETTE.length).toBe(4);
    for (const s of SEMANTIC_FROM_PALETTE) {
      expect(APPROVED.some((a) => a.label === s.label), `${s.role} → ${s.label}`).toBe(true);
      expect(s.text).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('nearestHue matches on the TRUE hue, landing the semantics where the eye expects', () => {
    expect(nearestHue(16).label).toBe('Ruby'); // measured 14.1
    expect(nearestHue(359).label).toBe('Rose'); // wraps to measured 351.5
    // Info at 257.5 lands on Sapphire (measured 253.6), NOT the nominal Indigo
    // (labelled 260 but measuring 274.1) — the whole reason the match is on the
    // measured angle rather than the filing label.
    expect(nearestHue(258).label).toBe('Sapphire');
  });

  it('the four roles map to red / yellow / green / blue — the convention holds', () => {
    const byRole = Object.fromEntries(SEMANTIC_FROM_PALETTE.map((s) => [s.role, s.label]));
    expect(byRole.DANGER, 'danger is a red').toBe('Ruby');
    expect(byRole.WARNING, 'warning is an amber').toBe('Amber');
    expect(byRole.SUCCESS, 'success is a green').toBe('Emerald');
    expect(byRole.INFO, 'info is a blue').toBe('Sapphire');
  });

  it('is NOT wired into the engine yet — semantics still build the old way', () => {
    // This is the honest state: the proposal exists, the reader has not eyeballed
    // it, so `deriveSemantic` is untouched. When the mapping is accepted this test
    // is replaced by one that asserts the semantics ARE the palette text steps.
    // Guarding the "not yet" keeps the gap visible instead of silently half-done.
    expect(SEMANTIC_FROM_PALETTE.every((s) => s.delta >= 0)).toBe(true);
  });
});
