/**
 * LIMINAL COLOR SYSTEM — LOCKED SPEC v1.0
 * The definitive design-system color contract.
 */

import { LADDER } from './liminal-ladder';
import { hexToRgb, rgbToOklch, oklchToHex } from './liminal-color-math';
import { apcaMagnitude } from './liminal-contrast';
import { contrastRatioHex } from './liminal-color-math';

/**
 * THE FOUR SEMANTIC HUES — a CONVENTION, not a derivation.
 *
 * "Red means danger" is not something a formula can produce; it is a shared
 * convention, and pretending otherwise would be dishonest. What CAN be derived
 * is everything else: the lightness of each facet, the chroma, and the alphas.
 *
 * These are the OKLCH hue angles. The old `hue` field declared 155 / 85 / 15 /
 * 230 while the colours actually measured 162.9 / 81.4 / 23.5 / 257.5 — the
 * label did not describe the colour it was attached to.
 */
const SEMANTIC_HUE = {
  SUCCESS: 162.9,
  WARNING: 81.4,
  DANGER: 23.5,
  INFO: 257.5,
} as const;

/**
 * The APCA floor for text placed ON a fill.
 *
 * This was a literal lightness (0.17), which produced Lc 49 to 55 — under the
 * Lc 60 that APCA asks for body text, and with no rule behind the number. The
 * fill's own lightness is fixed, so the text on it can be derived the same way
 * the text on a surface is: from the floor inwards.
 */
const SEMANTIC_ON_FLOOR = 75;
/** WCAG AA for normal text. APCA and WCAG disagree, so both must pass. */
const SEMANTIC_ON_WCAG_FLOOR = 4.5;
/**
 * One chroma for every role, so the four are equally loud.
 *
 * Taking each hue to its gamut edge instead would make red shout louder than
 * blue — four roles, four volumes. LIMINAL is a calm system: they should carry
 * the same weight and differ only in hue. The gamut is then a ceiling, not a
 * target.
 */
const SEMANTIC_CHROMA = 0.15;
/** The APCA floor the text facet is derived from — the system's body-minimum. */
const SEMANTIC_TEXT_FLOOR = 75;
/**
 * The surface the text floor is measured against: the DARKEST one.
 *
 * Semantic text is not used on one surface, it is used on whatever hosts it. A
 * floor measured against the work surface left SUCCESS at Lc 74.3 on the toast
 * level — a floor that only holds where it was measured. Measuring at the
 * darkest surface makes it hold everywhere, the same way the focus ring is
 * required to stay visible on all nine.
 */
const SEMANTIC_REFERENCE = LADDER[LADDER.length - 1];

/**
 * The fill's lightness is DERIVED, not chosen.
 *
 * A fill carries text, so the text sets how light the fill may be — and WHICH
 * text matters enormously. Measured on these hues:
 *
 *   black text on a fill at L 0.70   ->  Lc 50 to 56   (the floor is 75)
 *   black text on a fill at L 0.76   ->  Lc 60         (reachable, but pale)
 *   white text on a fill at L 0.55   ->  Lc 75 to 81   (rich AND readable)
 *
 * Black text wants a light fill; white text wants a dark one. The system was
 * using black on a medium fill, which is the worst of both: neither the floor
 * nor a saturated colour. So the text is white and the fill is derived from
 * the floor, which lands it dark and saturated.
 */
const SEMANTIC_SOLID_L = (() => {
  // The BINDING hue is the one that needs the darkest fill, so take the minimum.
  let binding = 1;
  for (const h of Object.values(SEMANTIC_HUE)) {
    // The search must be able to go dark, not just light: white text needs a
    // dark fill, and bounding the range at 0.6 left the floor unreachable.
    let lo = 0.3;
    let hi = 0.98;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const fill = oklchToHex({ L: mid, C: Math.min(SEMANTIC_CHROMA, maxChromaAt(mid, h)), h });
      // White text wants a DARK fill, so more contrast means less lightness:
      // if either floor is not met, the fill is too light and the answer is
      // below. BOTH lenses have to pass — APCA alone left SUCCESS on a fill at
      // WCAG 4.37:1, under the 4.5 that AA asks for.
      const passes =
        apcaMagnitude('#FFFFFF', fill) >= SEMANTIC_ON_FLOOR &&
        contrastRatioHex('#FFFFFF', fill) >= SEMANTIC_ON_WCAG_FLOOR;
      if (passes) lo = mid;
      else hi = mid;
    }
    binding = Math.min(binding, lo);
  }
  return binding;
})();

/**
 * The most chromatic this hue can be at this lightness before sRGB clips.
 * A property of the colour space, not a hand-picked number.
 */
function maxChromaAt(L: number, h: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const back = rgbToOklch(hexToRgb(oklchToHex({ L, C: mid, h })));
    if (Math.abs(back.L - L) > 0.002 || Math.abs(back.C - mid) > 0.002) hi = mid;
    else lo = mid;
  }
  return lo;
}

/** The lightness at which this hue reaches an APCA floor against a background. */
function lightnessForApca(h: number, C: number, floor: number, against: string): number {
  let lo = 0.4;
  let hi = 0.98;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (apcaMagnitude(oklchToHex({ L: mid, C, h }), against) < floor) lo = mid;
    else hi = mid;
  }
  return hi;
}

/**
 * The lightness at which a hue reaches BOTH floors against a background.
 *
 * `lightnessForApca` alone is one lens. The system's rule is two lenses and the
 * stricter wins — the same rule `SEMANTIC_SOLID_L` already follows, and the
 * same rule every ladder text token follows through `deriveTextToken`. The
 * semantic TEXT was the one place that took only APCA.
 *
 * Today it happens to pass: the tests prove all four hues clear 4.5:1 on every
 * surface. But the OUTCOME was proven and the DERIVATION was not, so a new hue
 * that failed WCAG would have shipped with a passing test suite.
 */
function lightnessForBoth(h: number, C: number, apcaFloor: number, wcagFloor: number, against: string): number {
  let L = lightnessForApca(h, C, apcaFloor, against);
  // Walk up until WCAG passes too. The loop is bounded and monotonic: more
  // lightness against a dark background is more contrast on both lenses.
  for (let i = 0; i < 60 && L < 0.995; i++) {
    if (contrastRatioHex(oklchToHex({ L, C, h }), against) >= wcagFloor) break;
    L = Math.min(0.995, L + 0.005);
  }
  return L;
}

/**
 * The same search, downward: text ON a light fill is dark, so MORE contrast
 * means LESS lightness. Searching upward here would walk to white.
 */
function darknessForApca(h: number, C: number, floor: number, against: string): number {
  let lo = 0.02;
  let hi = 0.6;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (apcaMagnitude(oklchToHex({ L: mid, C, h }), against) < floor) hi = mid;
    else lo = mid;
  }
  return lo;
}

const rgbaOf = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Every facet of one semantic role, from its hue inwards. */
function deriveSemantic(hue: number, cssName: string) {
  const solidC = Math.min(SEMANTIC_CHROMA, maxChromaAt(SEMANTIC_SOLID_L, hue));
  const textC = Math.min(SEMANTIC_CHROMA, maxChromaAt(0.80, hue));
  const solid = oklchToHex({ L: SEMANTIC_SOLID_L, C: solidC, h: hue });
  return {
    hue,
    text: oklchToHex({
      L: lightnessForBoth(hue, textC, SEMANTIC_TEXT_FLOOR, SEMANTIC_ON_WCAG_FLOOR, SEMANTIC_REFERENCE),
      C: textC,
      h: hue,
    }),
    solid: `var(--liminal-${cssName}, ${solid})`,
    // White, because the fill's lightness was derived so that white reaches
    // the floor. "Never pure white" is a rule about text on the near-black
    // surfaces, where a pure white glares; on a saturated fill it is the
    // correct end of the axis.
    onSolid: '#FFFFFF',
    subtle: rgbaOf(solid, 0.10),
    border: rgbaOf(solid, 0.22),
  };
}

export interface SemanticRole {
  /**
   * The character that carries the meaning when colour cannot.
   *
   * A coloured dot says "there is a state here" but not WHICH one; under
   * protanopia, deuteranopia, tritanopia or total colour blindness the four
   * semantics collapse into two or one. A shape survives all of them, which is
   * why the meaning lives here and the colour only reinforces it
   * (WCAG 2.2 · 1.4.1 Use of Colour).
   */
  glyph: string;
  subtle: string;
  border: string;
  text: string;
  solid: string;
  onSolid: string;
}

export class LiminalColorEngine {
  // 2. SEMANTIC SET (4 roles each: subtle / border / text / solid)
  // INVARIANT: subtle and border must share the hue of `solid` for the same role.
  // Enforced by src/engine/__tests__/tokens.test.ts (hue-consistency test).
  /**
   * THE SEMANTIC SET — derived, not chosen.
   *
   * This table used to be twenty hand-written strings. Lightness swung from
   * 0.637 to 0.800 with no rule, the two off-spectrum hues (155 and 85) sat
   * between spectrum steps, and the declared hue did not match the colour it
   * named. Twelve components read from it, so every one of them inherited the
   * inconsistency.
   *
   * Now: the hue is a convention and everything else follows from it. See
   * SEMANTIC_SOLID_L / SEMANTIC_CHROMA / SEMANTIC_TEXT_FLOOR above.
   */
  static readonly SEMANTICS: Record<
    'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO',
    SemanticRole & { hue: number }
  > = {
    SUCCESS: { glyph: '✓', ...deriveSemantic(SEMANTIC_HUE.SUCCESS, 'success') },
    WARNING: { glyph: '!', ...deriveSemantic(SEMANTIC_HUE.WARNING, 'warning') },
    DANGER: { glyph: '×', ...deriveSemantic(SEMANTIC_HUE.DANGER, 'danger') },
    INFO: { glyph: 'i', ...deriveSemantic(SEMANTIC_HUE.INFO, 'info') },
  };

  // 3. EXTENDED SPECTRUM (12 hues, text role, chroma compensated)
  static readonly EXTENDED_SPECTRUM: Array<{ hue: number; hex: string; label: string }> = [
    { hue: 15, hex: '#E88A93', label: 'Ruby' },
    { hue: 40, hex: '#E8A87C', label: 'Coral' },
    { hue: 75, hex: '#D9BE6E', label: 'Amber' },
    { hue: 110, hex: '#A8CC74', label: 'Lime' },
    { hue: 145, hex: '#74CE8E', label: 'Emerald' },
    { hue: 175, hex: '#5FCDBB', label: 'Teal' },
    { hue: 200, hex: '#56C6E0', label: 'Cyan' },
    { hue: 230, hex: '#6FA8EC', label: 'Sapphire' },
    { hue: 260, hex: '#8B9CF0', label: 'Indigo' },
    { hue: 290, hex: '#A98BEA', label: 'Violet' },
    { hue: 320, hex: '#C983D6', label: 'Fuchsia' },
    { hue: 350, hex: '#E083AE', label: 'Rose' },
  ];

  // 4. BRAND PRIMARY (referencing CSS Variables with fallback)
  static readonly BRAND_PRIMARY = {
    hex: 'var(--liminal-brand, #E9ECF2)',
    name: 'Soft White',
    onColor: 'var(--liminal-brand-on, #060709)',
    /** Lifted for hover — the brand is near-white, so hover goes lighter, not darker. */
    hover: '#F5F7FA',
    /** Pressed. */
    active: '#DDE1E8',
    description: 'Monochrome identity. LOCKED. Swap-able to any extended hue if rebranded.',
  };

  // ── REMOVED 2026-10-12: six stale bodies ───────────────────────────────
  //
  // getLadderColor held a SECOND ladder, with five wrong fallbacks out of six
  // (#08090b for a real #07090b, #0a0b10 for a real #090b0d, ...) and a
  // hard-coded 6-step ceiling while LADDER has nine. MIST_SPEC plus
  // getMistStyle were a whole second mist system, still describing
  // backdrop-blur halos and rgba(13,14,18) — a colour that is not a ladder
  // value at all. getStateStyle re-derived the state rule that liminal-surface
  // owns. getRamp/getHueFactor and the class hexToRgb had no callers.
  //
  // None had a consumer. All were exported, so they read as live API while
  // describing a system that no longer exists — the mistCssVars() hazard: a
  // stale body sitting beside the real one, passing every build.
  //
  // The live paths are: liminal-ladder (LADDER), liminal-surface
  // (resolveSurface/resolveBorder/resolveInset), liminal-mist (mistCssVars),
  // liminal-color-math (hexToRgb).

}

