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
import { LADDER, LADDER_CHROMA } from '../liminal-ladder';
import { LiminalColorEngine } from '../liminal-color-engine';

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
    // (The old assertion here was `delta >= 0` — vacuous. Round 7 replaced it
    // with something that would actually fail if the wiring landed.)
    expect(LiminalColorEngine.SEMANTICS.DANGER.solid).toContain('ba4646');
    expect(LiminalColorEngine.SEMANTICS.INFO.solid).toContain('3271c8');
  });
});

/* ------------------------------------------------------------------ */
/* MERCILESS COLOUR AUDIT — round 7 (2026-10-20).                     */
/* Every number below was measured live from the engine during the     */
/* audit; the pins carry their measured values so a regression reads   */
/* as a fact change, not a mystery.                                    */
/* ------------------------------------------------------------------ */

const gap = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** OKLab euclidean distance — the discriminability metric. */
const deltaE = (hexA: string, hexB: string): number => {
  const A = rgbToOklch(hexToRgb(hexA));
  const B = rgbToOklch(hexToRgb(hexB));
  const toAB = (c: { L: number; C: number; h: number }) => ({
    L: c.L,
    a: c.C * Math.cos((c.h * Math.PI) / 180),
    b: c.C * Math.sin((c.h * Math.PI) / 180),
  });
  const x = toAB(A);
  const y = toAB(B);
  return Math.sqrt((x.L - y.L) ** 2 + (x.a - y.a) ** 2 + (x.b - y.b) ** 2);
};

const stepOf = (label: string, n: number) =>
  PALETTE.find((p) => p.label === label)!.steps.find((s) => s.n === n)!;

describe('the merciless colour audit — measured pins (round 7)', () => {
  it('reported semantic deltas are MEASURED, not nominal — the label-hue bug is dead', () => {
    for (const s of SEMANTIC_FROM_PALETTE) {
      const hue = nearestHue(s.angle);
      expect(s.delta).toBeCloseTo(gap(hue.hueMeasured, s.angle), 10);
    }
    const byRole = Object.fromEntries(SEMANTIC_FROM_PALETTE.map((s) => [s.role, s.delta]));
    // Measured: INFO 3.9° · DANGER 9.4° · WARNING 9.9° · SUCCESS 11.1°.
    // The old nominal-hue math reported 27.5 / 8.5 / 6.4 / 17.9 — the INFO
    // "Δ27.5°" was an artefact of comparing against Sapphire's LABEL (230)
    // while the mapping itself always used the measured hue (253.6).
    expect(byRole.INFO).toBeLessThan(5);
    expect(byRole.DANGER).toBeLessThan(10);
    expect(byRole.WARNING).toBeLessThan(11);
    expect(byRole.SUCCESS).toBeLessThan(12);
  });

  it('wheel coverage — warm hole ≤ 45°, cool crowd ≥ 18° (measured 41.2° / 20.5°)', () => {
    const hs = PALETTE.map((p) => p.hueMeasured).sort((a, b) => a - b);
    const gaps = hs.map((h, i) => (i === 0 ? gap(hs[hs.length - 1], h) : h - hs[i - 1]));
    // Largest: Ruby→Coral 41.2° — no pure orange/vermilion exists in the set.
    // Smallest: Sapphire→Indigo 20.5° — four hues crowd a 98° blue-violet arc.
    expect(Math.max(...gaps)).toBeLessThanOrEqual(45);
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(18);
  });

  it('labels are nominal coordinates — 6 of 12 drift ≥ 10°, worst is Sapphire 23.6°', () => {
    const drifts = PALETTE.map((p) => ({ label: p.label, d: gap(p.hue, p.hueMeasured) }));
    const worst = drifts.reduce((a, b) => (b.d > a.d ? b : a));
    expect(worst.label, 'Sapphire is the worst offender — measured 253.6 vs label 230').toBe('Sapphire');
    expect(worst.d).toBeLessThanOrEqual(25);
    // Ruby 0.9 · Coral 15.3 · Amber 16.3 · Lime 17.1 · Emerald 6.8 · Teal 6.2 ·
    // Cyan 15.6 · Sapphire 23.6 · Indigo 14.1 · Violet 7.3 · Fuchsia 1.2 · Rose 1.5.
    // If a future relabel shrinks this count, the test flips ON PURPOSE — the
    // reader said labels must stay honest about what they are.
    expect(drifts.filter((x) => x.d >= 10).length).toBe(6);
  });

  it('discriminability floor — tightest pair per role stays ≥ 0.03 ΔE (OKLab)', () => {
    const minPair = (n: number): number => {
      let min = Infinity;
      for (let i = 0; i < PALETTE.length; i++)
        for (let j = i + 1; j < PALETTE.length; j++)
          min = Math.min(min, deltaE(stepOf(PALETTE[i].label, n).hex, stepOf(PALETTE[j].label, n).hex));
      return min;
    };
    expect(minPair(2)).toBeGreaterThanOrEqual(0.03); // 0.0311 Emerald/Teal — fills
    expect(minPair(5)).toBeGreaterThanOrEqual(0.045); // 0.0473 Lime/Emerald — borders
    expect(minPair(7)).toBeGreaterThanOrEqual(0.04); // 0.0440 Sapphire/Indigo — text
  });

  it('fills hold white text — steps 1–2 ≥ 7:1 (AAA), step 3 ≥ 6:1 (floor: Amber 6.29)', () => {
    for (const p of PALETTE) {
      expect(contrastRatioHex('#FFFFFF', stepOf(p.label, 1).hex)).toBeGreaterThanOrEqual(7);
      expect(contrastRatioHex('#FFFFFF', stepOf(p.label, 2).hex)).toBeGreaterThanOrEqual(7);
      expect(contrastRatioHex('#FFFFFF', stepOf(p.label, 3).hex)).toBeGreaterThanOrEqual(6);
    }
  });

  it('stage-and-actor — the quietest step-2 fill is ≥ 5× the stage chroma', () => {
    // Min fill C = 0.041 (Sapphire s2) vs LADDER_CHROMA 0.0069 → 5.9×.
    // Saturation alone separates figure from ground before lightness joins in.
    const minFillC = Math.min(...PALETTE.map((p) => stepOf(p.label, 2).C));
    expect(minFillC / LADDER_CHROMA).toBeGreaterThanOrEqual(5);
  });

  it('approved L spread is identity physics, documented — Amber 0.808 … Violet 0.702', () => {
    const Ls = APPROVED.map((a) => rgbToOklch(hexToRgb(a.hex)).L);
    // Yellows reflect, purples absorb: equal L would flatten the family
    // identity. The 0.105 spread (~12.6 q) is the price of keeping step 7
    // byte-identical to the approved colours — and it is pinned so a
    // re-approval cannot silently widen it.
    expect(Math.max(...Ls) - Math.min(...Ls)).toBeLessThanOrEqual(0.12);
  });
});
