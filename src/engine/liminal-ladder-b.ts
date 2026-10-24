/**
 * LIMINAL · LADDER B (FOUNDATION, v2)
 * «نردبان B: شش پله بالای بوم، خنثی. هر پله یک قدم دیدنی از پلهٔ قبلی است.»
 *
 * This module is the v2 foundation. It is deliberately dependency-free and is
 * NOT yet wired into the v1 engine (liminal-ladder.ts). The v1 engine stays as
 * it is until each stage of v2 (border, shadow, rim, states) is approved by eye.
 *
 * PROVENANCE — every number here has one label (see LIMINAL-POLICY-B.md §0):
 *   • hexes ........................ CHOICE, approved by eye (eye test, 2026-10-24)
 *   • step ≈ 1 L* ................. EYE-APPROVED on ONE phone, ONE observer
 *   • no measured JND exists yet .. the psychophysical session is still pending
 *
 * THE RECORDED EYE TEST (ladder-b-eye-test.html, phone 375×812 @3×):
 *   adjacent pairs ....... 18 / 18 seen as different
 *   identical catch pairs. 4 / 4 seen as same (0 false alarms)
 *   ordering ............. 7 / 7 correct, darkest to lightest
 * That is a strong eye result, not a validated measurement.
 */

export interface LadderStep {
  readonly id: string;
  readonly role: string;
  readonly hex: string;
}

/** The approved ladder, canvas first. Neutral: R = G = B on every step except the canvas. */
export const LADDER_B: readonly LadderStep[] = [
  { id: 'S0', role: 'canvas', hex: '#060709' },
  { id: 'S1', role: 'surface', hex: '#0B0B0B' },
  { id: 'S2', role: 'elevated', hex: '#0E0E0E' },
  { id: 'S3', role: 'overlay', hex: '#111111' },
  { id: 'S4', role: 'sub-overlay', hex: '#131313' },
  { id: 'S5', role: 'popover', hex: '#151515' },
  { id: 'S6', role: 'modal', hex: '#171717' },
] as const;

/** Highest level on the ladder. Anything above it is not part of the system. */
export const LADDER_B_TOP = LADDER_B.length - 1;

/** The eye-test record this ladder rests on. Kept next to the ladder so a change is visible. */
export const LADDER_B_EYE_TEST = {
  date: '2026-10-24',
  device: 'phone 375×812 @3×',
  observers: 1,
  adjacentPairs: 18,
  adjacentSeen: 18,
  catchPairs: 4,
  falseAlarms: 0,
  orderCorrect: true,
} as const;

/** sRGB 8-bit channel → linear light. */
function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance Y of a #RRGGBB colour. */
export function luminanceY(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** CIE L* of a #RRGGBB colour (CIE 1976 lightness, D65). */
export function lightnessStar(hex: string): number {
  const y = luminanceY(hex);
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
}

/** Step size in L* between two consecutive levels. The first level has no step. */
export function stepLStar(level: number): number {
  if (level <= 0 || level > LADDER_B_TOP) throw new RangeError(`level ${level} has no step`);
  return lightnessStar(LADDER_B[level].hex) - lightnessStar(LADDER_B[level - 1].hex);
}

/** Hex of a ladder level. Throws outside the ladder: there is no S7. */
export function ladderHex(level: number): string {
  if (!Number.isInteger(level) || level < 0 || level > LADDER_B_TOP) {
    throw new RangeError(`level ${level} is outside the ladder (0..${LADDER_B_TOP})`);
  }
  return LADDER_B[level].hex;
}

/**
 * BORDER — HALF A STEP (approved by eye, 2026-10-24).
 *
 * A border sits BETWEEN two levels. It is the lightness halfway between the
 * level it belongs to and the level above it, so it reads as a line, not as a
 * surface. Chosen over one full step (too loud on a 1-L* ladder) and over no
 * border (the card then has no edge at all). The eye chose it as the point of
 * perception that is most visible yet most refined.
 *
 * Defined for levels 0..LADDER_B_TOP−1: the top level has no level above it.
 */
export const BORDER_HALF_B: readonly string[] = [
  '#090909', // S0 → between S0 and S1
  '#0D0D0D', // S1 → between S1 and S2
  '#101010', // S2
  '#121212', // S3
  '#141414', // S4
  '#161616', // S5 → between S5 and S6
] as const;

/** The half-step border colour for a level. The top has no border above it. */
export function borderHalfHex(level: number): string {
  if (!Number.isInteger(level) || level < 0 || level >= LADDER_B_TOP) {
    throw new RangeError(`level ${level} has no half-step border (0..${LADDER_B_TOP - 1})`);
  }
  return BORDER_HALF_B[level];
}

/** Computes the half-step border from the ladder (no table). Used to check the table. */
export function computeBorderHalfHex(level: number): string {
  const a = lightnessStar(LADDER_B[level].hex);
  const b = lightnessStar(LADDER_B[level + 1].hex);
  const L = (a + b) / 2;
  const y = L > 8 ? Math.pow((L + 16) / 116, 3) : L / 903.3;
  const encoded = y <= 0.0031308 ? 12.92 * y : 1.055 * Math.pow(y, 1 / 2.4) - 0.055;
  const v = Math.round(Math.max(0, Math.min(1, encoded)) * 255);
  const x = v.toString(16).padStart(2, '0').toUpperCase();
  return `#${x}${x}${x}`;
}

/**
 * RIM — HALF A STEP (approved by eye, 2026-10-24).
 *
 * Light on the edge of a surface: brightest on the top, middle at the sides,
 * least at the bottom. The shape is fixed; only the strength is chosen:
 *   top = k, sides = 2k/3, bottom = k/3   (k in local L*-steps)
 * Half a step means k = 0.5, so the top is half a step, the sides a third, the
 * bottom a sixth. Chosen over no rim and over one or one-and-a-half steps.
 *
 * Defined for S1..S4 only. S5 and S6 cannot take a full rim without leaving the
 * ladder; that is the ceiling question, decided separately.
 */
export interface RimHalf {
  readonly top: string;
  readonly side: string;
  readonly bottom: string;
}

export const RIM_HALF_B: Readonly<Record<number, RimHalf>> = {
  1: { top: '#0D0D0D', side: '#0C0C0C', bottom: '#0C0C0C' },
  2: { top: '#101010', side: '#0F0F0F', bottom: '#0F0F0F' },
  3: { top: '#121212', side: '#121212', bottom: '#111111' },
  4: { top: '#141414', side: '#141414', bottom: '#131313' },
} as const;

/** The half-step rim for a level. Only S1..S4 have one. */
export function rimHalfHex(level: number): RimHalf {
  const r = RIM_HALF_B[level];
  if (r === undefined) {
    throw new RangeError(`level ${level} has no half-step rim (1..4)`);
  }
  return r;
}

/** Computes the half-step rim from the ladder (no table). Used to check the table. */
export function computeRimHalf(level: number): RimHalf {
  const base = lightnessStar(LADDER_B[level].hex);
  const step = lightnessStar(LADDER_B[level + 1].hex) - base;
  const k = 0.5;
  const at = (offset: number): string => {
    const L = base + offset * step;
    const y = L > 8 ? Math.pow((L + 16) / 116, 3) : L / 903.3;
    const encoded = y <= 0.0031308 ? 12.92 * y : 1.055 * Math.pow(y, 1 / 2.4) - 0.055;
    const v = Math.round(Math.max(0, Math.min(1, encoded)) * 255);
    const x = v.toString(16).padStart(2, '0').toUpperCase();
    return `#${x}${x}${x}`;
  };
  return { top: at(k), side: at((2 * k) / 3), bottom: at(k / 3) };
}
