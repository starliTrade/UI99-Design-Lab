/**
 * LIMINAL · TONAL LADDER (PRIMITIVE)
 * «نردبان، ابتدایی‌ترین لایه‌ی سیستم است — به هیچ چیز وابسته نیست.»
 *
 * This module is deliberately dependency-free. The ladder is the foundation of
 * every other engine, so it must be importable without pulling anything in.
 *
 * It was extracted from spec-engine.ts to break a real circular dependency:
 *   motion-engine → spec-engine → component-engine → motion-engine
 * The motion engine needs ladder colours for the skeleton keyframes, and
 * spec-engine re-exports from component-engine, so the ladder could not live
 * in spec-engine without the cycle. Here it can be imported by anyone.
 *
 * TARGET ΔL = 0.0127 (OKLCH lightness), anchored at S0 (mother canvas, L = 0.128).
 * Why 0.0127 and not 0.015: 0.0127 is the average step of the original
 * hand-picked palette — the number the design already encoded. 0.015 was an
 * aspiration that was never true in the hexes and pushed the first surface
 * measurably further from the canvas. Evidence: design-lab/ladder-compare.html.
 *
 * 8-bit hex cannot hit an exact ΔL, so the sequence minimises the worst
 * deviation from the target. Realized steps stay inside [0.011, 0.015], which is
 * asserted in src/engine/__tests__/tokens.test.ts.
 */

export const LADDER = ['#060709', '#08090b', '#0a0b10', '#0d0e11', '#101114', '#131418'] as const;

/** Midpoints between ladder steps, used for fractional surface levels. */
export const HALF = ['#07080a', '#090a0e', '#0b0d11', '#0e0f12', '#111216'] as const;

/**
 * Resolve a surface level to a colour.
 * Integer levels map to LADDER, fractional levels to HALF.
 */
export const getLadderColor = (n: number): string => {
  n = Math.max(0, Math.min(5, n));
  return Number.isInteger(n) ? LADDER[n] : HALF[Math.floor(n)];
};

/**
 * Focus ring colour.
 * Must stay ≥3:1 (WCAG 2.2 non-text) against every surface in LADDER.
 * A ladder step (n+1) reads as dark-on-dark (~1.01:1) and is NOT acceptable.
 * Verified by src/engine/__tests__/tokens.test.ts.
 */
export const FOCUS_RING_COLOR = 'var(--liminal-brand, #E9ECF2)';
