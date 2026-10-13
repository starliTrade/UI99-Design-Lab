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

/**
 * OKLCH → sRGB hex (the inverse of `rgbToOklch`).
 *
 * This is what lets the ladder be *generated* rather than hand-picked: the
 * formula produces (L, C, h), and this turns it into the hex a browser can
 * render. Out-of-gamut results are clamped per channel.
 */
export function oklchToHex({ L, C, h }: OKLCH): string {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const encode = (c: number): number => {
    const v = Math.max(0, Math.min(1, c));
    const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.round(srgb * 255);
  };

  return (
    '#' +
    [r, g, bl]
      .map((c) => encode(c).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * OKLCH to sRGB.
 *
 * The engine could go one way only: it read a hex and told you its lightness,
 * which is enough to CHECK a palette and not enough to GENERATE one. A theme
 * changes the hue, and a changed hue has to come back out as a hex.
 *
 * The maths is the standard Björn Ottosson conversion. The result is clamped
 * into gamut rather than rejected: a hue at high chroma can ask for a colour
 * sRGB cannot show, and the honest answer is the nearest one it can.
 */
export function oklchToRgb({ L, C, h }: OKLCH): RGB {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // linear sRGB to sRGB
  const gamma = (v: number) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  };

  return { r: gamma(lr), g: gamma(lg), b: gamma(lb) };
}

/** The `#rrggbb` form of an RGB triple. */
export function rgbToHex({ r, g, b }: RGB): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
