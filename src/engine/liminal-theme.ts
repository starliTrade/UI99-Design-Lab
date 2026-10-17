import { LADDER, HALF, CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, PERCEPTUAL_QUANTUM } from './liminal-ladder';
import { hexToRgb, rgbToOklch, oklchToRgb, rgbToHex } from './liminal-color-math';
import { LiminalLayoutEngine as L } from './liminal-layout-engine';
import { LiminalMotionEngine as M } from './liminal-motion-engine';
import { LiminalColorEngine as C } from './liminal-color-engine';

/**
 * LIMINAL · THEME
 * «تم یک مقیاس است، نه یک رنگ.»
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT USED TO REGENERATE THE LADDER AT A HUE. IT NO LONGER DOES.
 *
 * LIMINAL's identity is MONOCHROME — the code says so about the brand
 * ("Monochrome identity. LOCKED.") and the ladder proves it: chroma 0.0069, a
 * pure luminance ramp. Measured, a hue theme turns that ramp green, purple or
 * red:
 *
 *   system (258.4)  #060709 #07090b #090b0d …   neutral
 *   hue 145         #060806 #080907 #090b09 …   green
 *   hue 300         #070609 #09080b …           purple
 *   chroma 0.04     #000a01 #020c02 …           saturated green
 *
 * A ramp that can turn green is not an identity. And the theme carried a second
 * defect on top of it: it regenerated the HALF-STEPS by its own method, so all
 * eight differed from the engine's `HALF` — a second answer for the same value,
 * the same defect class as the two surface resolvers. At hue 145 one of the
 * eight left the perceptual band.
 *
 * So the ladder is FIXED. It is the identity, and an identity is not a setting.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A THEME MAY CHANGE — two SCALES, and they move together.
 *
 *   density   spacing, control heights AND radii, multiplied as one set. Scaling
 *             the padding without the radii breaks the concentric law
 *             (`r_inner = max(4, r_outer − padding)`), which is what the old
 *             theme did. And the touch floor is enforced, not warned about:
 *             `density: 0.8` took CONTROL.md to 35.2px, below the 44px minimum.
 *
 *   motion    the durations, with a floor so nothing becomes instant.
 *
 *   NOT the semantic hues. Those are a convention — success is green because
 *   readers expect it to be — and a theme that turns success purple is not a
 *   theme, it is a bug.
 */
/**
 * The band a realised step must sit in.
 *
 * The lower bound is the quantum itself: a step below it is a pair the eye
 * cannot separate, which is the one thing the ladder exists to avoid. The upper
 * bound is 1.5q, the point at which the ladder starts to read as jumps.
 */
const MIN_STEP_Q = 1.0;
const MAX_STEP_Q = 1.5;

export interface LiminalThemeOptions {
  /**
   * Multiplies the geometric scales AS ONE SET — spacing, control heights and
   * radii. 1 is the designed density.
   *
   * The lower bound is not a preference: `CONTROL.md` is 44px because that is
   * the touch floor, and a density that takes it below is clamped and reported.
   */
  density?: number;
  /** Multiplies every duration, with a floor so nothing becomes instant. */
  motion?: number;
  /** A name for the generated scope, for debugging. */
  name?: string;
}

export interface ThemeWarning {
  /** Which scale was out of bounds. */
  scale: 'density' | 'motion';
  /** What was asked for. */
  asked: number;
  /** What the engine used instead. */
  used: number;
  why: string;
}

export interface LiminalTheme {
  name: string;
  density: number;
  motion: number;
  /**
   * The nine surfaces. The engine's own, always — the ladder is the identity.
   * It is still emitted into the scope so a theme block is self-contained.
   */
  ladder: string[];
  /** The half-steps. The engine's own, for the same reason. */
  halves: string[];
  /** The CSS that overrides the defaults. Drop it in a scope. */
  css: string;
  /**
   * A scale that was clamped, and why.
   *
   * The old theme WARNED about a hue whose ladder could not hold its steps and
   * shipped it anyway. A warning that does not change the outcome is a comment.
   * These are clamps: the engine used a different number than the one asked for.
   */
  warnings: ThemeWarning[];
}

/**
 * The nearest 8-bit hex to a target lightness, by SEARCH.
 *
 * Rounding is not good enough, and the reason is the gamut. sRGB is not equally
 * wide at every hue: near 0° (red) it is narrow, so the eight-bit values near a
 * target lightness are further apart than they are near 258° (the system's own
 * blue-violet). Measured: at hue 0 the naive round-trip realises a step of
 * 0.85q — below the 1.07q–1.27q band the eye reads as a scale.
 *
 * So the theme does what the shipped ladder did: it searches the neighbouring
 * values and keeps the one closest to the target. Same method, same guarantee.
 */
function nearestLightness(target: number, chroma: number, hue: number): string {
  const base = oklchToRgb({ L: target, C: chroma, h: hue });
  let best = rgbToHex(base);
  let bestErr = Math.abs(rgbToOklch(base).L - target);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dg = -1; dg <= 1; dg++) {
      for (let db = -1; db <= 1; db++) {
        const cand = { r: base.r + dr, g: base.g + dg, b: base.b + db };
        if (cand.r < 0 || cand.r > 255 || cand.g < 0 || cand.g > 255 || cand.b < 0 || cand.b > 255) continue;
        const hex = rgbToHex(cand);
        const err = Math.abs(rgbToOklch(hexToRgb(hex)).L - target);
        if (err < bestErr) { bestErr = err; best = hex; }
      }
    }
  }
  return best;
}

/**
 * The ladder at a given hue, using the system's own step and lightness range.
 *
 * Rounding first, search only where rounding is not good enough — and the
 * difference matters. The shipped ladder was itself optimised by search, but
 * for STEP VARIANCE rather than for each level's error, so a search that
 * minimises per-level error returns a DIFFERENT ladder at the default hue:
 * `#07090a` where the system ships `#07090b`.
 *
 * Both are defensible. The system's is the one that was eye-tested, so the
 * theme treats it as the reference and only repairs a step that falls outside
 * the band the eye reads as a scale.
 */
export function ladderAtHue(hue: number, chroma = LADDER_CHROMA): string[] {
  const naive: string[] = [];
  for (let n = 0; n < 9; n++) {
    naive.push(rgbToHex(oklchToRgb({ L: CANVAS_L + n * LADDER_STEP, C: chroma, h: hue })));
  }

  const out = [...naive];
  for (let n = 1; n < out.length; n++) {
    const dL = rgbToOklch(hexToRgb(out[n])).L - rgbToOklch(hexToRgb(out[n - 1])).L;
    const q = dL / PERCEPTUAL_QUANTUM;
    if (q < MIN_STEP_Q || q > MAX_STEP_Q) {
      // Repair this level toward its target, then re-check.
      out[n] = nearestLightness(CANVAS_L + n * LADDER_STEP, chroma, hue);
    }
  }
  return out;
}

/** The half-steps, which sit between the ladder's own. */
export function halfStepsAtHue(hue: number, chroma = LADDER_CHROMA): string[] {
  const out: string[] = [];
  for (let n = 0; n < 8; n++) {
    out.push(nearestLightness(CANVAS_L + (n + 0.5) * LADDER_STEP, chroma, hue));
  }
  return out;
}

export function createLiminalTheme(options: LiminalThemeOptions = {}): LiminalTheme {
  const { density: askedDensity = 1, motion: askedMotion = 1, name = 'liminal' } = options;

  const warnings: ThemeWarning[] = [];

  // ── density: the touch floor is a CLAMP, not a warning ────────────────────
  // `CONTROL.md` is 44px because that is the floor a finger needs. A density of
  // 0.8 asked for 35.2px; the old theme emitted it and mentioned it afterwards.
  const minDensity = L.TARGET.min / L.CONTROL.md;
  const density = Math.max(minDensity, askedDensity);
  if (density !== askedDensity) {
    warnings.push({
      scale: 'density',
      asked: askedDensity,
      used: density,
      why: `CONTROL.md would fall to ${(L.CONTROL.md * askedDensity).toFixed(1)}px, below the ${L.TARGET.min}px touch floor`,
    });
  }

  // ── motion: a floor, so nothing becomes instant ───────────────────────────
  const minMotion = 0.25;
  const motion = Math.max(minMotion, askedMotion);
  if (motion !== askedMotion) {
    warnings.push({ scale: 'motion', asked: askedMotion, used: motion, why: 'below the floor where a transition reads as instant' });
  }

  const lines: string[] = [];
  lines.push(`/* LIMINAL theme — ${name} */`);
  lines.push(`/* density ${density} · motion ${motion} — the ladder is the identity and is not a setting */`);

  // The ladder and its half-steps: the engine's own, always.
  LADDER.forEach((hex, i) => lines.push(`--liminal-s${i}: ${hex};`));
  (HALF as readonly string[]).forEach((hex, i) => lines.push(`--liminal-s${i}-5: ${hex};`));

  if (density !== 1) {
    const scale = (v: number) => `${Math.round(v * density * 100) / 100}px`;
    Object.entries(L.SPACING).forEach(([k, v]) => lines.push(`--liminal-space-${k}: ${scale(v)};`));
    Object.entries(L.CONTROL).forEach(([k, v]) => lines.push(`--liminal-control-${k}: ${scale(v)};`));
    // THE RADII MOVE WITH THE PADDING. Scaling one and not the other breaks
    // `r_inner = max(4, r_outer − padding)` — the concentric law — which is
    // exactly what the old theme did. `full` is a sentinel, not a length.
    Object.entries(L.RADIUS).forEach(([k, v]) => {
      if (typeof v === 'number' && v < 100) lines.push(`--liminal-radius-${k}: ${scale(v)};`);
    });
  }

  if (motion !== 1) {
    Object.entries(M.DURATION).forEach(([k, v]) => lines.push(`--liminal-duration-${k}: ${Math.round(v * motion)}ms;`));
  }

  return {
    name,
    density,
    motion,
    ladder: [...LADDER],
    halves: [...(HALF as readonly string[])],
    css: `[data-liminal-theme="${name}"] {\n${lines.map((l) => '  ' + l).join('\n')}\n}`,
    warnings,
  };
}

/**
 * The theme as a plain object, for a consumer that wants the values in JS.
 * A component reads the CSS; this is for tooling, tests and the docs page.
 */
export function themeValues(theme: LiminalTheme): Record<string, string> {
  const out: Record<string, string> = {};
  theme.ladder.forEach((hex, i) => (out[`--liminal-s${i}`] = hex));
  return out;
}

/** True when a hex is inside the sRGB gamut the browser can show. */
export function inGamut(hex: string): boolean {
  const back = rgbToHex(oklchToRgb(rgbToOklch(hexToRgb(hex))));
  return back === hex;
}

/**
 * A FULL SCALE PER HUE.
 *
 * The spectrum shipped one colour per hue — twelve swatches. Radix Colors ships
 * twelve STEPS per hue, which is a different capability: a consumer who wants "a
 * green surface at three elevations" has nothing to reach for with a single
 * swatch, and reaches for a hand-picked hex instead.
 *
 * So each hue gets the ladder's own treatment: the same lightness range, the
 * same step, the same search for the nearest in-gamut value. The hue and its
 * chroma are the only things that differ, which is what makes it the same
 * system rather than a second palette.
 *
 * The steps are named for their JOB, not their number, because a number tells a
 * consumer nothing about which one to use:
 *
 *   1  canvas       the page behind everything
 *   2  subtle       a faint wash
 *   3  surface      a panel
 *   4  raised       a control at rest
 *   5  hover        a control under the pointer
 *   6  active       a control under the press
 *   7  border       a boundary that should be seen
 *   8  solid        a fill that carries white text
 *   9  solidHover   the same fill, under the pointer
 *   10 text         readable on 1 and 2
 *   11 textStrong   readable on 3 and 4
 *   12 emphasis     the loudest this hue gets
 */
export const HUE_STEP_NAMES = [
  'canvas', 'subtle', 'surface', 'raised', 'hover', 'active',
  'border', 'solid', 'solidHover', 'text', 'textStrong', 'emphasis',
] as const;

export type HueStep = (typeof HUE_STEP_NAMES)[number];

export interface HueScale {
  hue: number;
  label: string;
  chroma: number;
  /** Twelve steps, from the page behind everything to the loudest this hue gets. */
  steps: Record<HueStep, string>;
}

/**
 * The twelve steps, at a hue.
 *
 * The lightness range is the ladder's own — the same perceptual band the whole
 * system lives in. The chroma is the hue's calibrated value, held constant
 * across the steps for the same reason the ladder holds its own: a scale moves
 * in lightness, and a palette moves in everything.
 */
export function hueScale(hue: number, label: string, chroma: number): HueScale {
  const lo = CANVAS_L;
  const hi = CANVAS_L + 8 * LADDER_STEP;

  // A hue cannot always hold the chroma it was given.
  //
  // Measured: at hue 15 (Ruby) with a chroma of 0.15, the `active` step landed
  // at L 0.2115 — 0.93 of a quantum ABOVE the band's ceiling. sRGB is narrower
  // near red than near the system's own blue-violet, so the same chroma asks
  // for a colour the format cannot show and the clamp pushes it out of the
  // band. The chroma comes down until the band is reachable, which keeps the
  // scale a scale.
  let c = chroma;
  for (let i = 0; i < 40; i++) {
    const top = rgbToOklch(hexToRgb(nearestLightness(hi, c, hue))).L;
    if (top <= hi + 0.5 * PERCEPTUAL_QUANTUM) break;
    c = Math.round((c - 0.005) * 1000) / 1000;
    if (c <= 0.02) break;
  }
  chroma = c;
  const at = (t: number) => nearestLightness(lo + (hi - lo) * t, chroma, hue);
  const steps = {
    canvas: at(0),
    subtle: at(0.08),
    surface: at(0.18),
    raised: at(0.3),
    hover: at(0.38),
    active: at(0.46),
    border: at(0.56),
    solid: at(0.72),
    solidHover: at(0.78),
    text: at(0.88),
    textStrong: at(0.94),
    emphasis: at(1),
  } as Record<HueStep, string>;
  return { hue, label, chroma, steps };
}

/** Every spectrum hue, each with its twelve steps. */
export function allHueScales(): HueScale[] {
  return (C.EXTENDED_SPECTRUM as Array<{ hue: number; label: string; chroma?: number }>).map((h) =>
    hueScale(h.hue, h.label, h.chroma ?? 0.15),
  );
}
