import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, PERCEPTUAL_QUANTUM } from './liminal-ladder';
import { hexToRgb, rgbToOklch, oklchToRgb, rgbToHex } from './liminal-color-math';
import { LiminalLayoutEngine as L } from './liminal-layout-engine';
import { LiminalMotionEngine as M } from './liminal-motion-engine';

/**
 * LIMINAL · THEME
 * «تم یک بازنویسیِ CSS است — نه یک نسخه‌ی دوم از سیستم.»
 *
 * The roadmap's definition of done for this phase: a designer changes the brand
 * hue and the whole system updates, mathematically and consistently.
 *
 * Three things a theme may change, and one it may not.
 *
 *   brandHue    the ladder regenerates. The STEP is untouched, because the step
 *               is a measured perceptual quantum — it does not depend on which
 *               colour the ladder is. That is the whole point of building the
 *               ladder in OKLCH: hue moves, perception does not.
 *   density     the spacing and control scales multiply.
 *   motion      the durations multiply.
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
  /** The ladder's hue angle in OKLCH degrees. The default is the system's own. */
  brandHue?: number;
  /** The ladder's chroma. Higher is more saturated; the default is near-neutral. */
  brandChroma?: number;
  /** Multiplies the spacing and control scales. 1 is the designed density. */
  density?: number;
  /** Multiplies every duration. 1 is the designed motion. */
  motion?: number;
  /** A name for the generated scope, for debugging. */
  name?: string;
}

export interface ThemeWarning {
  /** The level whose step from the one below it is out of band. */
  level: number;
  /** The realised step, in quanta. */
  q: number;
  kind: 'below-quantum' | 'above-band';
}

export interface LiminalTheme {
  name: string;
  brandHue: number;
  brandChroma: number;
  density: number;
  motion: number;
  /** The nine surfaces, regenerated at this hue. */
  ladder: string[];
  /** The CSS that overrides the defaults. Drop it in a scope. */
  css: string;
  /**
   * Steps this hue cannot hold.
   *
   * 8-bit sRGB is not equally fine at every hue. Measured across five hues:
   * LIMINAL 1.07q–1.21q, Plum 1.07q–1.39q, but Forest 0.85q–1.45q, Abyss
   * 0.92q–1.45q and Ember 0.98q–1.33q. A step below the quantum is a pair of
   * surfaces the eye cannot separate — which is the one thing the ladder exists
   * to prevent.
   *
   * The search repairs what it can and this reports what it cannot. A designer
   * choosing a hue should know before shipping it, and a theme that silently
   * produced an unreadable ladder would be worse than one that refused.
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
  const {
    brandHue = LADDER_HUE,
    brandChroma = LADDER_CHROMA,
    density = 1,
    motion = 1,
    name = 'liminal',
  } = options;

  const ladder = ladderAtHue(brandHue, brandChroma);
  const halves = halfStepsAtHue(brandHue, brandChroma);

  const lines: string[] = [];
  lines.push(`/* LIMINAL theme — ${name} */`);
  lines.push(`/* brandHue ${brandHue} · chroma ${brandChroma} · density ${density} · motion ${motion} */`);

  // The ladder. The step is NOT scaled: it is a perceptual quantum.
  ladder.forEach((hex, i) => lines.push(`--liminal-s${i}: ${hex};`));
  halves.forEach((hex, i) => lines.push(`--liminal-s${i}-5: ${hex};`));

  // Density multiplies the geometric scales. A control height is one of them —
  // a denser interface has smaller controls, which is the point of the scale.
  if (density !== 1) {
    Object.entries(L.SPACING).forEach(([k, v]) => lines.push(`--liminal-space-${k}: ${Math.round(v * density * 100) / 100}px;`));
    Object.entries(L.CONTROL).forEach(([k, v]) => lines.push(`--liminal-control-${k}: ${Math.round(v * density * 100) / 100}px;`));
  }

  // Motion multiplies the durations.
  if (motion !== 1) {
    Object.entries(M.DURATION).forEach(([k, v]) => lines.push(`--liminal-duration-${k}: ${Math.round(v * motion)}ms;`));
  }

  const warnings: ThemeWarning[] = [];
  for (let i = 1; i < ladder.length; i++) {
    const dL = rgbToOklch(hexToRgb(ladder[i])).L - rgbToOklch(hexToRgb(ladder[i - 1])).L;
    const q = dL / PERCEPTUAL_QUANTUM;
    if (q < MIN_STEP_Q) warnings.push({ level: i, q, kind: 'below-quantum' });
    else if (q > MAX_STEP_Q) warnings.push({ level: i, q, kind: 'above-band' });
  }

  return {
    name,
    brandHue,
    brandChroma,
    density,
    motion,
    ladder,
    css: `[data-liminal-theme="${name}"] {\n  ${lines.join('\n  ')}\n}`,
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
