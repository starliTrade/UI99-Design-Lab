import { describe, it, expect } from 'vitest';
import {
  LADDER,
  HALF,
  getTextAlpha,
  TEXT_HIERARCHY,
} from '../spec-engine';
import { resolveSurface, ROLE_LEVEL } from '../liminal-surface';
import { Z_INDEX } from '../spec-engine';
import { TEXT_ROLE_SPEC, whiteAlphaApcaOn } from '../liminal-contrast';
import {
  PERCEPTUAL_QUANTUM,
  CANVAS_L,
  LADDER_STEP,
  LADDER_CHROMA,
  LADDER_HUE,
  LADDER_SIZE,
  FOCUS_RING_COLOR,
  LADDER_EXACT,
  HALF_EXACT,
} from '../liminal-ladder';
import { LiminalColorEngine } from '../liminal-color-engine';
import { LiminalLayoutEngine } from '../liminal-layout-engine';
import { LiminalComponentEngine } from '../liminal-component-engine';
import {
  rgbToOklch,
  hexToRgb,
  contrastRatioHex,
  whiteAlphaContrastOn,
  oklchLightness,
  lightnessStep,
  oklchToHex,
} from '../liminal-color-math';

/**
 * ============================================================================
 * LIMINAL DESIGN CONTRACT — EXECUTABLE SPECIFICATION
 * ============================================================================
 *
 * These tests are the machine-checkable half of DESIGN-CONTRACT.md.
 * A rule that is not asserted here is a rule nobody enforces.
 *
 * CONTRAST POLICY (WCAG 2.2):
 *   - primary / secondary / tertiary  → normal body text → AA 4.5:1 minimum
 *   - quaternary                      → large text & non-text only → 3:1 minimum
 *   - semantic text roles             → normal text → AA 4.5:1 minimum
 *   - focus ring / non-text UI        → AA non-text 3:1 minimum
 *
 * The quaternary restriction is deliberate and documented: it is the only level
 * permitted below 4.5:1, and it may never be used for small body text.
 */

const SURFACES = LADDER.map((hex, index) => ({ index, hex }));

const TEXT_CONTRAST_POLICY: Record<
  'primary' | 'secondary' | 'tertiary' | 'quaternary',
  { min: number; rationale: string }
> = {
  primary: { min: 4.5, rationale: 'primary body text' },
  secondary: { min: 4.5, rationale: 'secondary body text' },
  tertiary: { min: 4.5, rationale: 'captions, labels and table headers (normal-size text)' },
  quaternary: { min: 3.0, rationale: 'large text / non-text only — documented restriction' },
};

const NON_TEXT_MIN = 3.0;

function outlineColor(style: Record<string, unknown>): string | null {
  const outline = style.outline;
  if (typeof outline !== 'string' || outline === 'none') return null;
  const match = outline.match(/#[0-9a-fA-F]{3,8}/);
  return match ? match[0] : null;
}

describe('LIMINAL contract — surface ladder', () => {
  it('has nine surface steps', () => {
    expect(LADDER).toHaveLength(9);
    expect(LADDER).toHaveLength(LADDER_SIZE);
  });

  // ── The ladder is GENERATED, not hand-picked ────────────────────────────
  it('is reproduced exactly by the formula L(n) = CANVAS_L + n × STEP', () => {
    LADDER.forEach((hex, n) => {
      const generated = oklchToHex({
        L: CANVAS_L + n * LADDER_STEP,
        C: LADDER_CHROMA,
        h: LADDER_HUE,
      });
      expect(generated, `S${n}: formula gives ${generated}, ladder has ${hex}`).toBe(hex);
    });
  });

  it('holds chroma near-constant across the ladder', () => {
    // Chroma is what the eye reads as "tinted vs neutral", so it is the
    // property worth asserting. A ladder whose chroma swings is several
    // colours pretending to be one.
    const chromas = LADDER.map((hex) => rgbToOklch(hexToRgb(hex)).C);
    const ratio = Math.max(...chromas) / Math.min(...chromas);
    expect(ratio, `chroma varies ${ratio.toFixed(2)}×`).toBeLessThanOrEqual(1.6);
  });

  it('keeps the ladder essentially neutral at this darkness', () => {
    // At L ≈ 0.13 the reachable chroma is tiny, and the *realised* hue angle is
    // quantisation noise: one unit in the blue channel moves it ~13°. The
    // formula's input hue is constant (asserted above); what matters visually
    // is that the tint stays faint enough for that noise to be invisible.
    const chromas = LADDER.map((hex) => rgbToOklch(hexToRgb(hex)).C);
    expect(Math.max(...chromas), 'the ladder must stay near-neutral').toBeLessThanOrEqual(0.01);
  });

  it('is perceptually monotonic (each step is lighter than the last)', () => {
    for (let i = 1; i < LADDER.length; i++) {
      expect(
        lightnessStep(LADDER[i - 1], LADDER[i]),
        `S${i - 1} → S${i} must increase in OKLCH lightness`,
      ).toBeGreaterThan(0);
    }
  });

  // ── The measured quantum is the rule, not an arbitrary number ──────────
  it('never steps by less than the measured perceptual quantum', () => {
    // Below q, an adjacent pair is invisible at least half the time.
    for (let i = 1; i < LADDER.length; i++) {
      const step = lightnessStep(LADDER[i - 1], LADDER[i]);
      expect(
        step,
        `ΔL for S${i - 1} → S${i} is ${step.toFixed(4)} = ${(step / PERCEPTUAL_QUANTUM).toFixed(2)}q`,
      ).toBeGreaterThanOrEqual(PERCEPTUAL_QUANTUM);
    }
  });

  it('never steps by more than 1.5 quanta', () => {
    // Above 1.5q the ladder reads as jumpy rather than continuous.
    for (let i = 1; i < LADDER.length; i++) {
      const step = lightnessStep(LADDER[i - 1], LADDER[i]);
      expect(
        step,
        `ΔL for S${i - 1} → S${i} is ${(step / PERCEPTUAL_QUANTUM).toFixed(2)}q`,
      ).toBeLessThanOrEqual(PERCEPTUAL_QUANTUM * 1.5);
    }
  });

  it('anchors the canvas at the darkest allowed value', () => {
    expect(LADDER[0]).toBe('#060709');
  });

  it('keeps the ceiling at or below the contract limit L ≤ 0.204', () => {
    expect(oklchLightness(LADDER[LADDER.length - 1])).toBeLessThanOrEqual(0.204);
  });

  it('places the work surface two steps above the canvas', () => {
    // The user chose this depth by eye: 2.10q measured, 2.48q realised
    // (8-bit hex cannot place it closer — see design-lab/ladder-from-threshold.html).
    const workSurface = lightnessStep(LADDER[0], LADDER[2]);
    const quanta = workSurface / PERCEPTUAL_QUANTUM;
    expect(quanta, `work surface sits at ${quanta.toFixed(2)}q`).toBeGreaterThanOrEqual(2.0);
    expect(quanta, `work surface sits at ${quanta.toFixed(2)}q`).toBeLessThanOrEqual(2.6);
  });

  it('keeps half-steps below the quantum (a state change is felt, not seen)', () => {
    for (let i = 0; i < HALF.length; i++) {
      const halfStep = lightnessStep(LADDER[i], HALF[i]);
      expect(
        halfStep,
        `half-step at S${i} is ${(halfStep / PERCEPTUAL_QUANTUM).toFixed(2)}q`,
      ).toBeLessThan(PERCEPTUAL_QUANTUM);
    }
  });
});

describe('LIMINAL contract — text hierarchy contrast', () => {
  // Every role declares a USE, and the use sets the floor. See TEXT_ROLE_SPEC.
  for (const [level, spec] of Object.entries(TEXT_ROLE_SPEC)) {
    describe(`${level} (${spec.use} — WCAG ${spec.wcag}:1 / APCA Lc ${spec.apca})`, () => {
      for (const surface of SURFACES) {
        it(`meets both floors on S${surface.index} (${surface.hex})`, () => {
          const alpha = getTextAlpha(level as keyof typeof TEXT_ROLE_SPEC, surface.index);
          const wcag = whiteAlphaContrastOn(surface.hex, alpha);
          const lc = whiteAlphaApcaOn(surface.hex, alpha);
          expect(
            wcag,
            `${level} WCAG on S${surface.index} = ${wcag.toFixed(2)}:1 (need ${spec.wcag})`,
          ).toBeGreaterThanOrEqual(spec.wcag);
          expect(
            lc,
            `${level} APCA on S${surface.index} = Lc ${lc.toFixed(1)} (need ${spec.apca})`,
          ).toBeGreaterThanOrEqual(spec.apca);
        });
      }
    });
  }

  it('never uses pure white for typography', () => {
    for (const surface of SURFACES) {
      expect(getTextAlpha('primary', surface.index)).toBeLessThan(1);
    }
  });

  it('keeps the hierarchy ordered: primary > secondary === tertiary > quaternary', () => {
    for (const surface of SURFACES) {
      const primary = getTextAlpha('primary', surface.index);
      const secondary = getTextAlpha('secondary', surface.index);
      const tertiary = getTextAlpha('tertiary', surface.index);
      const quaternary = getTextAlpha('quaternary', surface.index);
      expect(primary, `primary > secondary on S${surface.index}`).toBeGreaterThan(secondary);
      expect(tertiary, `secondary === tertiary on S${surface.index}`).toBe(secondary);
      expect(tertiary, `tertiary > quaternary on S${surface.index}`).toBeGreaterThan(quaternary);
    }
  });

  it('documents that secondary and tertiary share one alpha (size/weight carries the level)', () => {
    // This is the deliberate consequence of option A: both are body text, so
    // both take the body-minimum floor. Their distinction is typographic.
    for (const surface of SURFACES) {
      expect(getTextAlpha('secondary', surface.index)).toBe(
        getTextAlpha('tertiary', surface.index),
      );
    }
  });
});

describe('LIMINAL contract — type scale is derived, not hand-picked', () => {
  const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

  it('every level is exactly ratio^(n − base) times the base', () => {
    // The ratio is the design; if a level drifts from it, the scale stops
    // reading as one family. This is what the old hand-written table broke:
    // 11/13/16/19/23/28/33/40 are rounded, so the ratio wobbled.
    for (const n of LEVELS) {
      const expected = Math.pow(LiminalLayoutEngine.TYPE_RATIO, n - LiminalLayoutEngine.TYPE_BASE_LEVEL);
      expect(LiminalLayoutEngine.typeScale(n)).toBeCloseTo(expected, 10);
    }
  });

  it('level 3 is the base itself', () => {
    expect(LiminalLayoutEngine.typeScale(LiminalLayoutEngine.TYPE_BASE_LEVEL)).toBe(1);
  });

  it('the scale is monotonic — each level is larger than the last', () => {
    for (let n = 1; n < 10; n++) {
      expect(LiminalLayoutEngine.typeScale(n + 1)).toBeGreaterThan(LiminalLayoutEngine.typeScale(n));
    }
  });

  it('the reference scale matches the ratio exactly', () => {
    // TYPOGRAPHY[n].fs is the scale resolved at the 16px reference base.
    for (const n of LEVELS) {
      const expected = LiminalLayoutEngine.TYPE_BASE_REF * LiminalLayoutEngine.typeScale(n);
      expect(LiminalLayoutEngine.TYPOGRAPHY[n].fs).toBeCloseTo(expected, 2);
    }
  });

  it('the fluid base is expressed in rem, so it honours the reader font size', () => {
    // A px-only clamp ignores the browser's font-size setting — WCAG 2.2 · 1.4.4.
    expect(LiminalLayoutEngine.TYPE_BASE_CSS).toMatch(/rem/);
    expect(LiminalLayoutEngine.TYPE_BASE_CSS).toMatch(/^clamp\(/);
    // No bare px length outside a comment: every length must be rem.
    expect(LiminalLayoutEngine.TYPE_BASE_CSS).not.toMatch(/\d+px/);
  });

  it('every level resolves through the fluid base, not a literal size', () => {
    for (const n of LEVELS) {
      const css = LiminalLayoutEngine.getTypeSizeCss(n);
      expect(css).toContain('--liminal-type-base');
      expect(css).not.toMatch(/\d+px/);
    }
  });

  it('line-height is a unitless multiplier, never a length', () => {
    // Publishing `lh` as px collapses every line box to ~1.6px.
    for (const n of LEVELS) {
      const lh = LiminalLayoutEngine.TYPOGRAPHY[n].lh;
      expect(typeof lh).toBe('number');
      expect(lh).toBeGreaterThan(1);
      expect(lh).toBeLessThan(2);
    }
  });

  it('getTypeStyle derives font-size from the fluid base', () => {
    const style = LiminalLayoutEngine.getTypeStyle(3);
    expect(String(style.fontSize)).toContain('--liminal-type-base');
    expect(String(style.fontSize)).not.toMatch(/\d+px/);
  });
});

describe('LIMINAL contract — semantic roles', () => {
  const roles = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;

  for (const role of roles) {
    it(`${role} text meets AA on every surface`, () => {
      const text = LiminalColorEngine.SEMANTICS[role].text;
      for (const surface of SURFACES) {
        const ratio = contrastRatioHex(text, surface.hex);
        expect(
          ratio,
          `${role} text ${text} on S${surface.index} = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it('keeps every semantic role internally hue-consistent', () => {
    // subtle / border / text must share the hue of the role's solid color,
    // otherwise the role reads as two different colors in the same component.
    for (const role of roles) {
      const semantics = LiminalColorEngine.SEMANTICS[role];
      const solidHue = rgbHue(semantics.solid);
      const borderHue = rgbHue(semantics.border);
      const textHue = rgbHue(semantics.text);
      expect(hueDistance(solidHue, borderHue), `${role} solid vs border hue`).toBeLessThan(12);
      expect(hueDistance(solidHue, textHue), `${role} solid vs text hue`).toBeLessThan(12);
    }
  });
});

describe('LIMINAL contract — focus visibility', () => {
  it('renders a focus ring that is actually visible on every surface', () => {
    const ring = LiminalComponentEngine.getFocusRing(true);
    const color = outlineColor(ring as Record<string, unknown>);
    expect(color, 'keyboard focus must produce a colored outline').not.toBeNull();

    for (const surface of SURFACES) {
      const ratio = contrastRatioHex(color as string, surface.hex);
      expect(
        ratio,
        `focus ring ${color} on S${surface.index} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(NON_TEXT_MIN);
    }
  });

  it('renders no ring for pointer focus', () => {
    const ring = LiminalComponentEngine.getFocusRing(false);
    expect(ring.outline).toBe('none');
  });

  it('the surface resolver draws a DOUBLE EDGE on focus, and none on idle', () => {
    /**
     * IT USED TO ASSERT THE BRAND'S HEX HERE, and that is what the focus no longer is.
     *
     * The ring was `FOCUS_RING_COLOR` — #E9ECF2 — at 15.7:1 to 17:1 where WCAG asks for 3:1.
     * Five times louder than it had to be, and the reader called it "destroyed, jarring, in
     * your face". No ladder level could replace it either: the ladder's highest step is
     * 1.10:1 against the work plane.
     *
     * So the focus is a SHAPE: an inner border and an outer line, both ladder levels, with a
     * 2px gap between them. Two parallel edges are a frequency, and the eye picks a repeated
     * edge out of a background far better than a single one at the same contrast.
     */
    const focus = resolveSurface({ role: 'control', state: 'focus' });
    // The lines are VARIABLE references, not hexes — `outlineColor` looks for a hex and finds
    // none, which is itself the point: the focus is no longer a colour of its own.
    expect(focus.outline, 'the outer line is a ladder level').toContain('var(--liminal-s');
    expect(focus.border, 'the inner line is a ladder level').toContain('var(--liminal-s');
    expect(focus.outlineOffset, 'and there is a gap between them').toBe('2px');
    // And nothing when the keyboard is not involved.
    const idle = resolveSurface({ role: 'control' });
    expect(idle.outline).toBe('none');
    expect(idle.outlineOffset).toBeUndefined();
  });
});

describe('LIMINAL contract — concentric radius law', () => {
  const R = LiminalLayoutEngine.RADIUS;

  it('follows R_inner = max(4, R_outer - P)', () => {
    expect(LiminalLayoutEngine.getConcentricRadius(24, 8)).toBe(16);
    expect(LiminalLayoutEngine.getConcentricRadius(20, 4)).toBe(16);
    expect(LiminalLayoutEngine.getConcentricRadius(16, 6)).toBe(10);
  });

  it('never drops below the 4px floor', () => {
    expect(LiminalLayoutEngine.getConcentricRadius(6, 20)).toBe(4);
    expect(LiminalLayoutEngine.getConcentricRadius(0, 8)).toBe(4);
  });

  it('keeps the numeric scale strictly increasing', () => {
    const scale = [4, 6, 8, 10, 12, 16, 20, 24];
    for (let i = 1; i < scale.length; i++) {
      expect(scale[i], `scale[${i}]`).toBeGreaterThan(scale[i - 1]);
    }
  });

  it('maps each named role to its documented step', () => {
    expect(R.chip).toBe(6);
    expect(R.control).toBe(10);
    expect(R.card).toBe(16);
    expect(R.panel).toBe(20);
    expect(R.container).toBe(24);
  });

  it('keeps every named role on the numeric scale (no off-scale magic numbers)', () => {
    const scale = new Set([4, 6, 8, 10, 12, 16, 20, 24]);
    for (const role of ['chip', 'control', 'card', 'panel', 'container'] as const) {
      expect(scale.has(R[role]), `${role} = ${R[role]} is off-scale`).toBe(true);
    }
  });
});

/** Shortest angular distance between two hue angles, in degrees (0..180). */
function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** Hue angle in degrees for a hex or rgba() color string. */
function rgbHue(color: string): number {
  const rgb = parseColor(color);
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

function parseColor(color: string): { r: number; g: number; b: number } {
  // Token colors may be authored as `var(--liminal-x, #RRGGBB)`; the fallback
  // is the value the engine actually computes with, so resolve to it.
  const varMatch = color.match(/var\([^,]+,\s*(#[0-9a-fA-F]{3,8})\s*\)/);
  const resolved = varMatch ? varMatch[1] : color;

  const hexMatch = resolved.match(/^#([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1].slice(0, 2), 16),
      g: parseInt(hexMatch[1].slice(2, 4), 16),
      b: parseInt(hexMatch[1].slice(4, 6), 16),
    };
  }
  const rgbaMatch = resolved.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
    };
  }
  throw new Error(`parseColor: unsupported color "${color}"`);
}


/**
 * THE LADDER THE BROWSER PAINTS IS THE LADDER THAT WAS DESIGNED.
 *
 * The target was always a constant — 0.009475 of L, the same for every step — and
 * the realised hex ladder is 1.07q to 1.21q. That spread is not the design; it is
 * 8-bit sRGB failing to write it, off by up to 0.199q at S4. `oklch()` carries
 * full precision, so the stylesheet publishes both and the exact value wins.
 */
describe('the exact ladder — the design, which hex cannot write', () => {
  /** The L out of an `oklch(L C H)` string. */
  const lightness = (s: string) => Number(s.match(/oklch\(([\d.]+)/)![1]);

  it('every step is EXACTLY the same, which the hex ladder is not', () => {
    const steps = LADDER_EXACT.slice(1).map((s, i) => lightness(s) - lightness(LADDER_EXACT[i]));
    for (const d of steps) expect(d).toBeCloseTo(LADDER_STEP, 9);
    expect(lightness(LADDER_EXACT[0])).toBeCloseTo(CANVAS_L, 9);
    expect(LADDER_STEP / PERCEPTUAL_QUANTUM).toBeCloseTo(1.1416, 3);
  });

  it('and the hex ladder is measurably off the design — which is why it exists', () => {
    // If the hexes were exact, the exact ladder would be pointless. This asserts
    // the error is real, so the second declaration is not decoration.
    const worst = Math.max(
      ...LADDER.map((hex, n) => Math.abs(oklchLightness(hex) - lightness(LADDER_EXACT[n])) / PERCEPTUAL_QUANTUM),
    );
    expect(worst, 'the hex ladder is further from the design than this').toBeGreaterThan(0.1);
  });

  it('the half-steps are exact too, because a border lands on one', () => {
    for (let i = 0; i < HALF_EXACT.length; i++) {
      expect(lightness(HALF_EXACT[i]) - lightness(HALF_EXACT[0])).toBeCloseTo(i * LADDER_STEP, 7);
    }
    expect(HALF_EXACT.length).toBe(8);
  });

  it('hex fallback still keeps Law 1 — every measured step ≥ 1q, noise band ≤ 0.25q', () => {
    // The audit measured the published hex table: steps land 1.07–1.21q, jittering
    // ±0.07q around the exact 1.1416q because one RGB unit at ladder darkness is a
    // third of a quantum. The law survives the rounding; the uniformity does not —
    // which is exactly why the oklch declaration exists.
    LADDER.slice(0, -1).forEach((hex, n) => {
      const s = lightnessStep(hex, LADDER[n + 1]) / PERCEPTUAL_QUANTUM;
      expect(s, `S${n}→S${n + 1} falls below one quantum in the hex fallback`).toBeGreaterThanOrEqual(1);
      expect(Math.abs(s - LADDER_STEP / PERCEPTUAL_QUANTUM), `S${n}→S${n + 1} noise exceeds the band`).toBeLessThanOrEqual(0.25);
    });
  });

  it('hex half-step OFFSETS survive 8-bit — every S(n).5 stays inside the visible band', () => {
    // Measured: 0.54–0.71q around the exact 0.5708q. The rounding noise (±0.14q)
    // is the same order as the half-step itself, yet the law survives: every
    // offset stays above the edge threshold (0.48q) and below one full quantum —
    // a hint, never a level. The right quantity is the offset from the step's own
    // hex, NOT the gap between consecutive halves (that is a full step by design).
    HALF.forEach((hex, n) => {
      const off = lightnessStep(LADDER[n], hex) / PERCEPTUAL_QUANTUM;
      expect(off, `S${n}.5 sank below the edge threshold`).toBeGreaterThan(0.48);
      expect(off, `S${n}.5 became a full level`).toBeLessThan(1);
    });
  });

  it('consecutive half-steps stay a full step apart — even through 8-bit', () => {
    // By design S(n).5→S(n+1).5 spans exactly one LADDER_STEP; measured on hex
    // 1.08–1.18q — the rounding never collapses two consecutive border levels.
    HALF.slice(0, -1).forEach((hex, n) => {
      expect(lightnessStep(hex, HALF[n + 1]) / PERCEPTUAL_QUANTUM).toBeGreaterThanOrEqual(1);
    });
  });
});

/**
 * THE BUTTON'S PADDING RATIO IS A CONSTANT — x = y × 3.
 *
 * It was three hand-picked pairs — 6/12, 10/18, 12/24 — whose ratio drifted from 2.0 to 1.8
 * and back. Measured on the rendered button, all three came out near 1.5 wide-to-tall, which
 * is nearly SQUARE, and the reader's eye said so before the numbers did: "lg has gone square,
 * and x should be larger than y."
 *
 * `x = y × 3` is the only option tested that holds a constant: the padding ratio is exactly
 * 3.0000 at every size, and the rendered shape lands near 2.0. The small drift that remains is
 * the LABEL — a button's width is its text plus its padding, and the text grows with the font
 * while the padding moves in fixed steps. That drift exists in every button ever built.
 */
describe('control padding — the horizontal is three times the vertical', () => {
  const P = LiminalLayoutEngine.CONTROL_PADDING;

  it('holds the SAME ratio at every size', () => {
    for (const [name, p] of Object.entries(P)) {
      expect(p.x / p.y, `${name} padding ratio`).toBeCloseTo(3, 6);
    }
  });

  it('and the ratio is identical across sizes, which is the property that matters', () => {
    const ratios = Object.values(P).map((p) => p.x / p.y);
    expect(new Set(ratios).size, 'the sizes have drifted apart').toBe(1);
  });

  it('and the rendered shape is wider than it is tall at every size', () => {
    // Width is the label plus twice the padding; the label grows with the font size.
    const LABEL = { sm: 28, md: 31, lg: 33 };
    for (const [name, h] of Object.entries(LiminalLayoutEngine.CONTROL)) {
      const p = P[name as keyof typeof P];
      const width = LABEL[name as keyof typeof LABEL] + 2 * p.x;
      expect(width / h, `${name} rendered shape`).toBeGreaterThan(1.8);
    }
  });
});

/**
 * THE RADIUS FOLLOWS THE HEIGHT — and the three numbers are a FORMULA.
 *
 * The standard is "the radius scales with the element's height": a 32px control takes 8, a
 * 44px control 10, a 52px control 12. Smaller elements get tighter corners and larger ones
 * softer, so the corner stays PROPORTIONAL to the shape.
 *
 * AND LIMINAL HAD THE OPPOSITE: every control size took the same radius, 10 — so a 32px button
 * and a 52px button had identical corners, which is the one thing the standard says not to do.
 *
 * `round(h / 8.8) * 2` reproduces the mapping exactly, so the scale is not written down and
 * cannot drift from the heights it belongs to.
 */
describe('control radius — derived from the height', () => {
  it('reproduces the standard mapping exactly', () => {
    expect(LiminalLayoutEngine.controlRadius(32)).toBe(8);
    expect(LiminalLayoutEngine.controlRadius(44)).toBe(10);
    expect(LiminalLayoutEngine.controlRadius(52)).toBe(12);
  });

  it('and the named radii ARE those values, computed rather than listed', () => {
    expect(LiminalLayoutEngine.CONTROL_RADIUS.sm).toBe(LiminalLayoutEngine.controlRadius(LiminalLayoutEngine.CONTROL.sm));
    expect(LiminalLayoutEngine.CONTROL_RADIUS.md).toBe(LiminalLayoutEngine.controlRadius(LiminalLayoutEngine.CONTROL.md));
    expect(LiminalLayoutEngine.CONTROL_RADIUS.lg).toBe(LiminalLayoutEngine.controlRadius(LiminalLayoutEngine.CONTROL.lg));
  });

  it('grows with the height, so no two sizes share a corner', () => {
    const r = Object.values(LiminalLayoutEngine.CONTROL_RADIUS);
    expect(new Set(r).size, 'two sizes share a radius').toBe(r.length);
    expect(r[0]).toBeLessThan(r[1]);
    expect(r[1]).toBeLessThan(r[2]);
  });

  it('and a fourth size would get its own radius without anyone picking one', () => {
    // The point of deriving it: adding a size does not mean choosing a corner.
    expect(LiminalLayoutEngine.controlRadius(64)).toBe(14);
    expect(LiminalLayoutEngine.controlRadius(24)).toBe(6);
  });

  it('and nesting stays concentric: inner = max(4, outer − padding)', () => {
    // The other half of the standard, and the one LIMINAL already had. It is a GEOMETRIC
    // relationship — two curves sharing a centre — so it does not know about layers.
    expect(LiminalLayoutEngine.getConcentricRadius(16, 10)).toBe(6);
    expect(LiminalLayoutEngine.getConcentricRadius(20, 10)).toBe(10);
    expect(LiminalLayoutEngine.getConcentricRadius(24, 16)).toBe(8);
    // And it never goes below the floor, however large the padding.
    expect(LiminalLayoutEngine.getConcentricRadius(16, 40)).toBe(4);
  });
});

/**
 * Z-INDEX IS THE LADDER LEVEL — it is not a second system.
 *
 * It was five hand-picked round numbers — 1000, 2000, 3000, 4000, 9999 — and it was the one
 * place in this engine where a number carried no information. An eye test settled it by
 * showing NOTHING: four stages, the round numbers and `z = level` and `z = level × 10` and
 * `z = level` with a stacking context, and all four looked identical.
 *
 * Which is the finding — the VALUES do not matter, the ORDER does, and the order is the layer
 * hierarchy the engine already has.
 */
describe('z-index — the ladder level, and a stacking context on every surface', () => {
  it('every role takes its own level', () => {
    for (const role of ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'] as const) {
      expect(Z_INDEX[role], `${role}`).toBe(ROLE_LEVEL[role]);
    }
  });

  it('and the order is the hierarchy, which is the only thing that matters', () => {
    const ordered = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'] as const;
    for (let i = 1; i < ordered.length; i++) {
      expect(Z_INDEX[ordered[i]], `${ordered[i - 1]} → ${ordered[i]}`).toBeGreaterThan(Z_INDEX[ordered[i - 1]]);
    }
  });

  it('the old round numbers are gone — no value is above the ladder', () => {
    expect(Math.max(...Object.values(Z_INDEX)), 'a round number survived').toBeLessThanOrEqual(8);
  });

  it('and every surface creates a stacking context', () => {
    // This is the half that removes the most magic: a child is above its parent by
    // construction, so a dropdown inside a modal needs no number at all.
    for (const role of ['panel', 'menu', 'modal', 'toast'] as const) {
      const s = resolveSurface({ role });
      expect(s.style.isolation, `${role} does not isolate`).toBe('isolate');
      expect(s.style.zIndex, `${role} has no z-index`).toBe(ROLE_LEVEL[role]);
    }
  });
});
