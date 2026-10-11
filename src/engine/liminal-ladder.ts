/**
 * LIMINAL · TONAL LADDER (PRIMITIVE)
 * «نردبان، ابتدایی‌ترین لایه‌ی سیستم است — به هیچ چیز وابسته نیست.»
 *
 * This module is deliberately dependency-free. The ladder is the foundation of
 * every other engine, so it must be importable without pulling anything in.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LADDER IS DERIVED FROM A MEASURED PERCEPTUAL THRESHOLD.
 *
 * Until 2026-10-11 the step was an assumption (0.015 in the contract, then the
 * measured average of a hand-picked palette, 0.0127). Neither was a perceptual
 * measurement. The step is now derived from the user's own threshold, measured
 * on their display with a constant-stimuli psychophysical test
 * (design-lab/threshold-test-precise.html, three sessions):
 *
 *     q = 0.0083   ΔL at 50% detection — the perceptual quantum
 *     r = 0.0112   ΔL at 95% detection — the reliable boundary  (r/q = 1.35)
 *
 * RULES the ladder obeys (all asserted in __tests__/tokens.test.ts):
 *   1. every realised step ≥ q            — otherwise that pair is invisible
 *   2. every realised step ≤ 1.5q         — otherwise the ladder feels jumpy
 *   3. the canvas is the anchor           — S0 is the darkest allowed value
 *   4. the ceiling stays at L ≤ 0.204     — the contract's darkness ceiling
 *
 * 8-bit hex cannot hit an arbitrary ΔL, and at this darkness the reachable steps
 * are irregular (0.0005–0.0038). The sequence below was chosen by search to
 * minimise step variance subject to rule 1. Realised steps: 1.07q – 1.27q.
 *
 * Structural relations are expressed in LADDER STEPS, not in raw ΔL:
 *   canvas → chrome        = 1 step   (1.27q)
 *   canvas → work surface  = 2 steps  (2.48q)
 *   canvas → nested panel  = 3 steps  (3.62q)
 *   canvas → floating      = 5 steps  (5.86q)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The perceptual quantum, measured. ΔL at 50% detection. */
export const PERCEPTUAL_QUANTUM = 0.0083;

/** The reliable boundary, measured. ΔL at 95% detection. */
export const RELIABLE_BOUNDARY = 0.0112;

/**
 * The surface ladder — nine steps, each 1.07q–1.27q above the last.
 * S0 is the canvas; S8 is the ceiling of allowed darkness.
 */
export const LADDER = [
  '#060709', // S0 canvas
  '#07090c', // S1 chrome
  '#090b0e', // S2 work surface
  '#0b0d10', // S3 nested panel
  '#0d0f12', // S4 raised control
  '#0f1114', // S5 floating
  '#111316', // S6 popover
  '#131518', // S7 modal
  '#15171a', // S8 ceiling
] as const;

/**
 * Midpoints between ladder steps — half-steps, used for state changes
 * (hover / active). A half-step is ~0.6q, deliberately below the threshold:
 * a state change should be *felt*, not *seen*.
 */
export const HALF = [
  '#07080a',
  '#080a0d',
  '#0a0c0f',
  '#0c0e11',
  '#0e1013',
  '#101215',
  '#121417',
  '#141619',
] as const;

/**
 * Resolve a surface level to a colour.
 * Integer levels map to LADDER, fractional levels to HALF.
 */
export const getLadderColor = (n: number): string => {
  const max = LADDER.length - 1;
  n = Math.max(0, Math.min(max, n));
  return Number.isInteger(n) ? LADDER[n] : HALF[Math.floor(n)];
};

/**
 * Focus ring colour.
 * Must stay ≥3:1 (WCAG 2.2 non-text) against every surface in LADDER — it
 * measures 15.2:1–17.0:1 across the ladder. A ladder step (n+1) reads as
 * dark-on-dark (~1.01:1) and is NOT acceptable.
 * Verified by src/engine/__tests__/tokens.test.ts.
 */
export const FOCUS_RING_COLOR = 'var(--liminal-brand, #E9ECF2)';
