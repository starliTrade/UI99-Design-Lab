import { describe, it, expect } from 'vitest';
import {
  LADDER,
  HALF,
  getTextAlpha,
  getLiminalStyle,
  TEXT_HIERARCHY,
} from '../spec-engine';
import { TEXT_ROLE_SPEC, whiteAlphaApcaOn } from '../liminal-contrast';
import {
  PERCEPTUAL_QUANTUM,
  CANVAS_L,
  LADDER_STEP,
  LADDER_CHROMA,
  LADDER_HUE,
  LADDER_SIZE,
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

  it('resolveInteractiveSurface keeps the ring visible in the focus state', () => {
    for (const surface of SURFACES) {
      const style = LiminalComponentEngine.resolveInteractiveSurface({
        surfaceLevel: surface.index,
        state: 'focus',
        isKeyboardFocused: true,
      });
      const color = outlineColor(style as Record<string, unknown>);
      expect(color, `S${surface.index} focus state must expose a ring color`).not.toBeNull();
      const ratio = contrastRatioHex(color as string, surface.hex);
      expect(
        ratio,
        `interactive focus ring on S${surface.index} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(NON_TEXT_MIN);
    }
  });

  it('getLiminalStyle never emits a dark-on-dark focus ring', () => {
    for (const surface of SURFACES) {
      const resolved = getLiminalStyle({
        surfaceLevel: surface.index,
        interactive: true,
        state: 'focus',
      });
      const color = outlineColor(resolved.style as Record<string, unknown>);
      if (color === null) continue;
      const ratio = contrastRatioHex(color, surface.hex);
      expect(
        ratio,
        `getLiminalStyle focus ring ${color} on S${surface.index} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(NON_TEXT_MIN);
    }
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
