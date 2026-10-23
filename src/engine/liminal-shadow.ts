/**
 * LIMINAL · THE SHADOW MODEL
 *
 * ONE producer, and it takes NUMBERS — the height above what the shadow falls on,
 * and the host it falls on — so it imports nothing. That matters: it is used by the
 * mist (which owns the floating surface), by the surface resolver (which attaches a
 * shadow to a floating role), and by the generators that write the contract, the CSS
 * variables and the DTCG tokens. A model that imported any of them would make a
 * cycle, and it did — `spec-engine` → mist → surface → `spec-engine` — the first
 * time this was written in the wrong place.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PEAK IS THE NUMBER, AND IT IS ONE QUANTUM.
 *
 * A shadow is TWO layers, and where they overlap the darkness is not either alpha:
 * it is `1 - (1-a)(1-b)`. The old model's peak was 0.642 combined, which composites
 * to #040507 over the work plane — 4.07q, FOUR times the threshold. The reader's
 * words: "blatant, jarring, obvious and separate", while the border and the rim were
 * at the boundary. The shadow was not at the boundary of anything.
 *
 * AND ONE QUANTUM, NOT HALF OF ONE. Measured against the edge threshold (0.48q,
 * measured on the reader's own display):
 *
 *   0.5q peak   1.04x   a HINT — barely at the threshold
 *   1.0q peak   2.08x   a SHADOW — the same margin the border has (2.4x)
 *
 * And the margin is what survives different conditions: a display or a viewing angle
 * that halves the sensitivity leaves a 1q shadow at 0.5q — still above the threshold
 * — and takes a 0.5q shadow to 0.25q, which is gone.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AND THE ALPHA DEPENDS ON THE HOST, so it is SOLVED rather than written down.
 *
 * The shadow colour is fixed — rgba(1,2,3) — so the same alpha is a different
 * distance in quanta on a different surface. Measured: one quantum needs 0.2477 over
 * the canvas and 0.0890 over the ceiling. A single number cannot be one quantum on
 * both, and a shadow that is 2.8x too dark on the ceiling is the defect this file
 * exists to prevent.
 *
 * So the alpha is found by search, per host, and memoised. Nothing here is
 * hand-picked: the radius is linear in the height, and the darkness is whatever puts
 * the peak exactly one quantum below what it falls on.
 */

/** The perceptual quantum, duplicated here so this module imports nothing. */
const Q = 0.0083;

/** The shadow's own colour. Darker than the canvas, and darker than every surface. */
const SHADOW_RGB = [1, 2, 3] as const;

/** sRGB 0..255 → OKLCH lightness, in continuous space — the browser does not round. */
function oklchLightness(rgb: readonly number[]): number {
  const [R, G, B] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
}

/** `fg` laid OVER `bg` at alpha `a`, in continuous space. */
const composite = (a: number, bg: readonly number[]): number[] =>
  bg.map((b, i) => b + a * (SHADOW_RGB[i] - b));

/**
 * The alpha whose PEAK lands `quanta` below the host.
 *
 * The search is exact to 80 iterations — a bisection on a monotonic function, so it
 * converges to machine precision. Memoised per host, because the host is always a
 * ladder level and there are nine of them.
 */
const alphaCache = new Map<string, number>();
export function shadowPeakAlpha(hostRgb: readonly number[], quanta = 1): number {
  const key = `${hostRgb.join(',')}|${quanta}`;
  const hit = alphaCache.get(key);
  if (hit !== undefined) return hit;
  const hostL = oklchLightness(hostRgb);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const d = (oklchLightness(composite(mid, hostRgb)) - hostL) / Q;
    if (Math.abs(d) > quanta) hi = mid;
    else lo = mid;
  }
  const found = (lo + hi) / 2;
  alphaCache.set(key, found);
  return found;
}

/**
 * Height in, radius out — and the darkness that puts the peak one quantum down.
 *
 * A floating surface blocks light over a wide area because it is FAR from what it
 * falls on, and the further it floats the wider and softer the shadow. The radius is
 * linear in the height with NO constant: the old `40 + h*3.2` was 93% constant at
 * height one and 61% at height eight, so every surface cast the same wide shadow and
 * the height moved it by 18%.
 */
export function shadowModel(height: number, hostRgb: readonly number[]) {
  const peak = shadowPeakAlpha(hostRgb);
  // Two layers, each carrying half the peak, so they overlap TO it.
  const each = 1 - Math.sqrt(1 - peak);
  return {
    // ONE STEP CLOSER (reader, mist page): the reach is measured from one step below
    // the surface's height, so every float's shadow is one step tighter than the raw
    // height would give. Alpha is still solved for one quantum — only the spread moves.
    near: 2 + (height - SHADOW_REACH_STEPS) * 1.5,
    far: 4 + (height - SHADOW_REACH_STEPS) * 6,
    nearAlpha: each,
    farAlpha: each,
    peak,
  };
}

/** How many ladder steps the shadow's reach is pulled in from the surface's height. */
export const SHADOW_REACH_STEPS = 1;

/** A floating surface's shadow, as a CSS value. */
export function floatShadow(height: number, hostRgb: readonly number[]): string {
  const { near, far, nearAlpha, farAlpha } = shadowModel(height, hostRgb);
  return `0 ${near.toFixed(1)}px ${far.toFixed(0)}px rgba(1, 2, 3, ${farAlpha.toFixed(4)}), 0 2px ${near.toFixed(1)}px rgba(1, 2, 3, ${nearAlpha.toFixed(4)})`;
}

/**
 * THE SHADOW OF AN OBJECT RESTING ON A SURFACE — a knob, a thumb, an active tab.
 *
 * NOT a smaller floating shadow, and that is why it has its own name. A floating
 * surface blocks light over a wide area because it is far from what it falls on; an
 * object touches its surface, so its shadow is a CONTACT shadow: tight, dark,
 * directly below, with a hairline of the object's own edge in it.
 */
export const REST_SHADOW = '0 1px 2px rgba(1, 2, 3, 0.35), 0 0 0 1px rgba(1, 2, 3, 0.12)';

/**
 * A SHADOW IS ONLY VISIBLE ON A SURFACE LIGHTER THAN IT.
 *
 * The shadow colour is darker than the canvas and the work plane — and NOT darker
 * than a well. A shadow cast onto a well is a shadow nobody can see, which is a
 * constraint rather than a rule to remember: the well is below the canvas, and light
 * does not fall upward.
 */
export const SHADOW_FLOOR = 'canvas or above — never onto a well';
