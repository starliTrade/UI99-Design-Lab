/**
 * LIMINAL · COLOR MATH
 * "ریاضیات خالص رنگ — پایه‌ی اعتبارسنجی سیستم"
 *
 * Zero-dependency color math used to *prove* the design contract:
 *  - sRGB hex parsing and alpha compositing
 *  - WCAG 2.x relative luminance and contrast ratio
 *  - OKLab / OKLCH conversion (the perceptual space the ladder is built on)
 *
 * This module exists so that token claims (contrast floors, ΔL steps) can be
 * asserted in tests instead of trusted. It is deliberately pure and side-effect
 * free so it can run in the browser, in Node, and in CI.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface OKLCH {
  /** Perceptual lightness, 0..1 */
  L: number;
  /** Chroma, 0..~0.4 */
  C: number;
  /** Hue angle in degrees, 0..360 */
  h: number;
}

/** Parse `#rgb` or `#rrggbb` into 0..255 channels. Throws on malformed input. */
export function hexToRgb(hex: string): RGB {
  const clean = hex.trim().replace(/^#/, '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`liminal-color-math: invalid hex color "${hex}"`);
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** sRGB channel (0..255) → linear-light channel (0..1). */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG 2.x contrast ratio between two opaque colors (1..21). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Contrast ratio between two hex colors. */
export function contrastRatioHex(a: string, b: string): number {
  return contrastRatio(hexToRgb(a), hexToRgb(b));
}

/**
 * Composite a foreground color over an opaque background at the given alpha,
 * exactly as the browser does for `rgba()` text on a solid surface.
 */
export function blendAlpha(fg: RGB, bg: RGB, alpha: number): RGB {
  const mix = (f: number, b: number) => Math.round(alpha * f + (1 - alpha) * b);
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
}

/**
 * Contrast ratio of white-at-alpha text over a solid hex surface.
 * This is the exact relation LIMINAL's text hierarchy relies on.
 */
export function whiteAlphaContrastOn(hex: string, alpha: number): number {
  const bg = hexToRgb(hex);
  const text = blendAlpha({ r: 255, g: 255, b: 255 }, bg, alpha);
  return contrastRatio(text, bg);
}

/**
 * Minimum white alpha that reaches `target` contrast on a solid hex surface.
 * Returns 1 if the target is unreachable.
 */
export function minWhiteAlphaForContrast(hex: string, target: number): number {
  for (let alpha = 0; alpha <= 1; alpha += 0.001) {
    if (whiteAlphaContrastOn(hex, alpha) >= target) {
      return Math.round(alpha * 1000) / 1000;
    }
  }
  return 1;
}

/** sRGB → OKLab (Björn Ottosson's reference implementation). */
export function rgbToOklab({ r, g, b }: RGB): { L: number; a: number; b: number } {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** sRGB → OKLCH (perceptual lightness, chroma, hue). */
export function rgbToOklch(rgb: RGB): OKLCH {
  const { L, a, b } = rgbToOklab(rgb);
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

/** Perceptual lightness (OKLCH L) of a hex color. */
export function oklchLightness(hex: string): number {
  return rgbToOklch(hexToRgb(hex)).L;
}

/**
 * Perceptual lightness step between two hex colors in OKLCH L.
 * Positive means `b` is lighter than `a`.
 */
export function lightnessStep(a: string, b: string): number {
  return oklchLightness(b) - oklchLightness(a);
}
