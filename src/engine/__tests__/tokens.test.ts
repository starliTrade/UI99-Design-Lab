import { describe, it, expect } from 'vitest';
import {
  LADDER,
  getTextAlpha,
  getLiminalStyle,
  TEXT_HIERARCHY,
} from '../spec-engine';
import { LiminalColorEngine } from '../liminal-color-engine';
import { LiminalComponentEngine } from '../liminal-component-engine';
import {
  contrastRatioHex,
  whiteAlphaContrastOn,
  oklchLightness,
  lightnessStep,
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
  it('has exactly six surface steps', () => {
    expect(LADDER).toHaveLength(6);
  });

  it('is perceptually monotonic (each step is lighter than the last)', () => {
    for (let i = 1; i < LADDER.length; i++) {
      expect(
        lightnessStep(LADDER[i - 1], LADDER[i]),
        `S${i - 1} → S${i} must increase in OKLCH lightness`,
      ).toBeGreaterThan(0);
    }
  });

  it('holds the locked perceptual step ΔL within [0.012, 0.020]', () => {
    for (let i = 1; i < LADDER.length; i++) {
      const step = lightnessStep(LADDER[i - 1], LADDER[i]);
      expect(step, `ΔL for S${i - 1} → S${i} is ${step.toFixed(4)}`).toBeGreaterThanOrEqual(0.012);
      expect(step, `ΔL for S${i - 1} → S${i} is ${step.toFixed(4)}`).toBeLessThanOrEqual(0.02);
    }
  });

  it('matches the contract claim that the canvas sits at L ≈ 0.128', () => {
    expect(oklchLightness('#060709')).toBeCloseTo(0.128, 2);
  });

  it('keeps the ceiling below the contract limit L ≤ 0.203', () => {
    expect(oklchLightness('#131418')).toBeLessThanOrEqual(0.203);
  });
});

describe('LIMINAL contract — text hierarchy contrast', () => {
  for (const [level, policy] of Object.entries(TEXT_CONTRAST_POLICY)) {
    describe(`${level} (min ${policy.min}:1 — ${policy.rationale})`, () => {
      for (const surface of SURFACES) {
        it(`passes on S${surface.index} (${surface.hex})`, () => {
          const alpha = getTextAlpha(level as keyof typeof TEXT_CONTRAST_POLICY, surface.index);
          const ratio = whiteAlphaContrastOn(surface.hex, alpha);
          expect(
            ratio,
            `${level} at alpha ${alpha} on S${surface.index} = ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(policy.min);
        });
      }
    });
  }

  it('never uses pure white for typography', () => {
    expect(TEXT_HIERARCHY.primary).toBeLessThan(1);
    expect(TEXT_HIERARCHY.secondary).toBeLessThan(TEXT_HIERARCHY.primary);
  });

  it('keeps the hierarchy strictly ordered (primary > secondary > tertiary > quaternary)', () => {
    for (const surface of SURFACES) {
      const primary = getTextAlpha('primary', surface.index);
      const secondary = getTextAlpha('secondary', surface.index);
      const tertiary = getTextAlpha('tertiary', surface.index);
      const quaternary = getTextAlpha('quaternary', surface.index);
      expect(primary).toBeGreaterThan(secondary);
      expect(secondary).toBeGreaterThan(tertiary);
      expect(tertiary).toBeGreaterThan(quaternary);
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
