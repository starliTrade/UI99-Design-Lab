/**
 * LIMINAL · CONTRAST ENGINE
 * «کنتراست ورودی است، نه چیزی که بعداً بازرسی شود.»
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 *
 * Until now every text token was a hand-picked white alpha: 0.88, 0.62, 0.46,
 * 0.35 — chosen by eye, then checked for contrast afterwards. That works until
 * it doesn't. The Phase 0 audit found tertiary text at 3.7:1 and quaternary at
 * 2.1:1 across 152 usages, because a hand-picked alpha happened to land below
 * the floor and nothing in the system could stop it.
 *
 * The Leonardo lesson is to invert the direction. You state the contrast you
 * need, and the system derives the alpha that MEETS it — so a failing value is
 * not something to catch in review, it is something the engine cannot produce.
 *
 * TWO LENSES, TAKE THE STRICTER
 *
 * WCAG 2.x is a ratio that ignores polarity. For light text on dark surfaces —
 * exactly the case this system lives in — it over-rates readability, because
 * the ratio is computed from relative luminance alone and does not model how
 * the eye actually handles glare and halation on dark backgrounds.
 *
 * APCA (the WCAG 3 draft) is polarity-aware and models the dark-surface case
 * properly. So this engine derives an alpha for BOTH floors and takes the
 * larger. A token is only emitted if it satisfies the ratio check and the
 * perceptual check. That is a stronger guarantee than either lens alone, and
 * it is the thing competitors do not do.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  hexToRgb,
  contrastRatio,
  blendAlpha,
  whiteAlphaContrastOn,
  minWhiteAlphaForContrast,
  type RGB,
} from './liminal-color-math';

/**
 * APCA's own luminance ("screen luminance", Y).
 *
 * This is NOT the WCAG relative luminance. APCA linearises with a simple 2.4
 * exponent rather than sRGB's piecewise curve, and uses slightly different
 * channel coefficients. Substituting one for the other silently shifts every
 * Lc value, so this is deliberately a separate function.
 */
export function apcaLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => Math.pow(c / 255, 2.4);
  return 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.072175 * lin(b);
}

/** APCA 0.1.9 constants, W3 release. */
const APCA = {
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scale: 1.14,
  offset: 0.027,
  deltaYmin: 0.0005,
  loClip: 0.1,
} as const;

/**
 * APCA (WCAG 3 draft) lightness contrast, Lc. Signed, per spec.
 *
 * Positive Lc = dark text on a light background.
 * Negative Lc = light text on a dark background.
 *
 * This system is dark-first, so the values that matter here are negative. The
 * spec is explicit that the sign must be preserved, so floors are compared
 * against the magnitude rather than by taking an absolute value here.
 */
export function apcaContrast(textHex: string, bgHex: string): number {
  const clamp = (y: number) =>
    y > APCA.blkThrs ? y : y + Math.pow(APCA.blkThrs - y, APCA.blkClmp);

  const txtY = clamp(apcaLuminance(textHex));
  const bgY = clamp(apcaLuminance(bgHex));

  if (Math.abs(bgY - txtY) < APCA.deltaYmin) return 0;

  let sapc: number;
  let output: number;

  if (bgY > txtY) {
    // Normal polarity: dark text on a light background → positive.
    sapc = (Math.pow(bgY, APCA.normBG) - Math.pow(txtY, APCA.normTXT)) * APCA.scale;
    output = sapc < APCA.loClip ? 0 : sapc - APCA.offset;
  } else {
    // Reverse polarity: light text on a dark background → negative.
    sapc = (Math.pow(bgY, APCA.revBG) - Math.pow(txtY, APCA.revTXT)) * APCA.scale;
    output = sapc > -APCA.loClip ? 0 : sapc + APCA.offset;
  }

  return output * 100;
}

/** Magnitude of Lc — what the readability floors are stated against. */
export function apcaMagnitude(textHex: string, bgHex: string): number {
  return Math.abs(apcaContrast(textHex, bgHex));
}

/** APCA Lc magnitude for white-at-alpha text over a solid hex surface. */
export function whiteAlphaApcaOn(hex: string, alpha: number): number {
  const bg = hexToRgb(hex);
  const text = blendAlpha({ r: 255, g: 255, b: 255 }, bg, alpha);
  const hexOf = (c: RGB) =>
    '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return apcaMagnitude(hexOf(text), hex);
}

/**
 * Minimum white alpha that reaches an APCA Lc magnitude target on a solid hex
 * surface. Returns 1 if the target is unreachable.
 */
export function minWhiteAlphaForApca(hex: string, target: number): number {
  // Quantize UP: the returned alpha must itself satisfy the target, because
  // the derived token is what ships. Rounding to the nearest thousandth can
  // land just under the floor (Lc 74.9 for a 75 floor), so step up until the
  // quantized value genuinely clears it.
  const QUANTUM = 1000;
  for (let i = 0; i <= QUANTUM; i++) {
    const alpha = i / QUANTUM;
    if (whiteAlphaApcaOn(hex, alpha) >= target) {
      return alpha;
    }
  }
  return 1;
}

/**
 * THE FLOORS, AS DECLARED USE.
 *
 * A floor is not a chosen number — it is the readability tier that a role's
 * DECLARED USE requires. Each entry names that use, so the number can be
 * audited against the reason it exists.
 *
 *   body-preferred  APCA Lc 90 — headings and primary copy
 *   body-minimum    APCA Lc 75 — any text meant to be read
 *   non-text        APCA Lc 30 — marks, indicators, metadata glyphs
 *
 * NOTE ON secondary AND tertiary
 * Both are body text, so both take the body-minimum floor and derive to the
 * SAME alpha. Their distinction is typographic (14px/400 body vs 12.5px/500
 * caption), not chromatic. This is deliberate: a hierarchy carried by size and
 * weight survives colour-blindness, glare and poor displays, whereas a
 * colour-only hierarchy does not. See DESIGN-CONTRACT.md §4.
 */
export const TEXT_ROLE_SPEC = {
  primary: { use: 'body-preferred', wcag: 4.5, apca: 90 },
  secondary: { use: 'body-minimum', wcag: 4.5, apca: 75 },
  tertiary: { use: 'body-minimum', wcag: 4.5, apca: 75 },
  /**
   * The floor for ANY text — APCA's lowest text band, and WCAG's large-text
   * floor. It is NOT for read copy: measured on the darkest surface it gives
   * 4.06:1, under the 4.5 that AA asks for normal text.
   *
   * Its legitimate uses are placeholders, disabled text (which WCAG 1.4.3
   * exempts) and decorative separators. Nine components were using it for
   * hints, labels and footers — read text — which is what the old `non-text`
   * label invited.
   */
  quaternary: { use: 'text-minimum', wcag: 3.0, apca: 30 },
} as const;

export type TextRole = keyof typeof TEXT_ROLE_SPEC;

/** WCAG 2.x ratios, derived from the declared use. */
export const CONTRAST_FLOOR = {
  primary: TEXT_ROLE_SPEC.primary.wcag,
  secondary: TEXT_ROLE_SPEC.secondary.wcag,
  tertiary: TEXT_ROLE_SPEC.tertiary.wcag,
  quaternary: TEXT_ROLE_SPEC.quaternary.wcag,
} as const;

/** APCA Lc floors, derived from the declared use. */
export const APCA_FLOOR = {
  primary: TEXT_ROLE_SPEC.primary.apca,
  secondary: TEXT_ROLE_SPEC.secondary.apca,
  tertiary: TEXT_ROLE_SPEC.tertiary.apca,
  quaternary: TEXT_ROLE_SPEC.quaternary.apca,
} as const;

export interface DerivedTextToken {
  role: TextRole;
  /** The binding alpha — the larger of the two lens requirements. */
  alpha: number;
  /** Which lens bound the result. Useful in review: it tells you why. */
  boundBy: 'wcag' | 'apca';
  wcagAlpha: number;
  apcaAlpha: number;
  /** Achieved values at the emitted alpha. */
  wcag: number;
  apca: number;
  /** The css colour string. */
  value: string;
}

/**
 * Derive one text token on one surface, from the floors inwards.
 *
 * This is the whole idea in one function: the caller states the role and the
 * surface, and receives an alpha that is guaranteed to satisfy both floors.
 * There is no path through this function that returns a failing colour.
 */
export function deriveTextToken(role: TextRole, against: string): DerivedTextToken {
  const wcagAlpha = minWhiteAlphaForContrast(against, CONTRAST_FLOOR[role]);
  const apcaAlpha = minWhiteAlphaForApca(against, APCA_FLOOR[role]);
  const alpha = Math.max(wcagAlpha, apcaAlpha);
  const boundBy: 'wcag' | 'apca' = apcaAlpha > wcagAlpha ? 'apca' : 'wcag';

  return {
    role,
    alpha,
    boundBy,
    wcagAlpha,
    apcaAlpha,
    wcag: whiteAlphaContrastOn(against, alpha),
    apca: whiteAlphaApcaOn(against, alpha),
    value: `rgba(255, 255, 255, ${alpha})`,
  };
}

/**
 * Derive the full text hierarchy for a ladder of surfaces.
 *
 * Returns `{ role: { surfaceIndex: token } }` so the generated table can be
 * diffed directly against the hand-picked one it replaces.
 */
export function deriveTextHierarchy(
  ladder: readonly string[],
): Record<TextRole, DerivedTextToken[]> {
  const roles: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];
  const out = {} as Record<TextRole, DerivedTextToken[]>;
  for (const role of roles) {
    out[role] = ladder.map((surface) => deriveTextToken(role, surface));
  }
  return out;
}

/** Convenience: the alpha alone, for callers that only need the number. */
export function resolveTextAlpha(role: TextRole, against: string): number {
  return deriveTextToken(role, against).alpha;
}
