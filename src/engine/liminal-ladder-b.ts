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
 * BORDER — HALF A STEP, ONLY ON NON-FLOATING LEVELS (approved by eye, 2026-10-24).
 *
 * Floating layers (S4 sub-overlay, S5 popover, S6 modal) have NO border. They are
 * separated from the layer below by their shadow, not by a line.
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
  '#101010', // S2 → between S2 and S3
  '#121212', // S3 → between S3 and S4
] as const;

/** Levels that float above the layer below: they never carry a border. */
export const FLOATING_LEVELS_B: readonly number[] = [4, 5, 6] as const;

/** The half-step border colour for a level. Floating levels have none. */
export function borderHalfHex(level: number): string {
  if (!Number.isInteger(level) || level < 0 || level > LADDER_B_TOP) {
    throw new RangeError(`level ${level} is outside the ladder (0..${LADDER_B_TOP})`);
  }
  if (FLOATING_LEVELS_B.includes(level)) {
    throw new RangeError(`level ${level} is floating and has no border (shadow only)`);
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

/**
 * SHADOW — NEAR (chosen by eye, 2026-10-24).
 *
 * Only floating layers (S4, S5, S6) carry a shadow. A shadow says "this layer
 * is above the one below", and nothing else: it never draws a line.
 *
 * The chosen shadow is the NEAR candidate: the smallest offset and spread that is
 * still seen as "floating", and the one closest to the perceptual boundary. The
 * eye reported the differences between candidates as small, which is why the
 * smallest one that still reads as floating was taken.
 *
 *   offset = 2px  ·  spread = 8px  ·  black at alpha 0.45
 *
 * The candidates were: none, near (2/8/0.45), medium (4/16/0.55), far (8/32/0.65).
 */
export interface ShadowSpec {
  readonly offsetY: number;
  readonly blur: number;
  readonly alpha: number;
}

export const SHADOW_NEAR_B: ShadowSpec = { offsetY: 2, blur: 8, alpha: 0.45 } as const;

/** The CSS box-shadow for a floating level. Non-floating levels have none. */
export function shadowCss(level: number): string {
  if (!Number.isInteger(level) || level < 1 || level > LADDER_B_TOP) {
    throw new RangeError(`level ${level} has no shadow (the canvas S0 is not a layer; shadows are 1..${LADDER_B_TOP})`);
  }
  const s = SHADOW_NEAR_B;
  return `0 ${s.offsetY}px ${s.blur}px rgba(0,0,0,${s.alpha})`;
}

/**
 * STATES — hover, active, disabled (eye-approved 2026-10-24).
 *
 * Each state has its own shape. They never share a value:
 *   - hover:    half a step UP from the level (the border value of the level).
 *   - active:   the half-step rim of the level (light on top, dimmer below).
 *   - disabled: half a step DOWN from the level, with muted text.
 *
 * Focus is NOT defined here. The approved focus candidate (a coloured double
 * ring) was rejected: a coloured border is outside the liminal rules.
 */
export function hoverHex(level: number): string {
  return borderHalfHex(level);
}

export function activeRim(level: number): RimHalf {
  return rimHalfHex(level);
}

export function disabledHex(level: number): string {
  if (level < 1 || level > LADDER_B_TOP) {
    throw new RangeError(`level ${level} has no step below for a disabled surface`);
  }
  return borderHalfHex(level - 1);
}

/** Text colour on a disabled control: white at alpha 0.35. */
export const DISABLED_TEXT_ALPHA = 0.35;

export function disabledTextCss(): string {
  return `rgba(255,255,255,${DISABLED_TEXT_ALPHA})`;
}

/**
 * FOCUS — 1px gap, lighter ring (chosen by eye, 2026-10-24).
 *
 * The focus ring is made of ladder steps only, never a free colour:
 *   - gap:  1px, filled with the step BELOW the control (the host it sits on).
 *   - ring: 1px, the step ABOVE the control (lighter).
 *
 * Why lighter, not darker: on this dark ladder a darker ring (S1) is almost
 * black and nearly disappears on the host (S2). The lighter ring (S4) is seen as
 * a clear edge. The chosen candidate is the 1px gap with the lighter ring.
 *
 * Why 1px and not 0.05px: 0.05px is not drawn on a screen. 1px is the smallest
 * real gap and the one the eye approved.
 *
 * The rejected candidates were: 2px gap (both shades) and the darker ring at 1px.
 */
export const FOCUS_GAP_PX = 1;
export const FOCUS_RING_PX = 1;

export interface FocusSpec {
  readonly gapHex: string;
  readonly ringHex: string;
  readonly gapPx: number;
  readonly ringPx: number;
}

/** The focus ring for a control at `level`. The ring is one step lighter than the control. */
export function focusSpec(level: number): FocusSpec {
  if (!Number.isInteger(level) || level < 1 || level >= LADDER_B_TOP) {
    throw new RangeError(`level ${level} has no focus ring (needs a step below and above, 1..${LADDER_B_TOP - 1})`);
  }
  return {
    gapHex: ladderHex(level - 1),
    ringHex: ladderHex(level + 1),
    gapPx: FOCUS_GAP_PX,
    ringPx: FOCUS_RING_PX,
  };
}

/** The CSS box-shadow for focus: gap in the host step, then the lighter ring. */
export function focusCss(level: number): string {
  const f = focusSpec(level);
  return `0 0 0 ${f.gapPx}px ${f.gapHex}, 0 0 0 ${f.gapPx + f.ringPx}px ${f.ringHex}`;
}

/**
 * CHILD STYLES (rule of 2026-10-24, from the owner).
 *
 * Every surface or component may place a child one level above it (parent + 1).
 * Each child takes one of four styles, chosen by its sensitivity and content:
 *   - simple:   no border, no rim, no shadow
 *   - bordered: half-step border of its level
 *   - shadowed: near shadow
 *   - rimmed:   half-step rim of its level
 * Border and rim may combine on one child (approved). Simple stands alone.
 *
 * No level is forbidden for a style. Floating levels (S4..S6) also take the
 * four styles (owner's answer on 2026-10-24, which replaces the earlier
 * "floating has no border" rule).
 *
 * Open: the ceiling. S5 and S6 have no half-step rim table yet, so a rimmed
 * child at S5 or S6 is refused until the ceiling is decided.
 */
export type ChildStyle = 'simple' | 'bordered' | 'shadowed' | 'rimmed';

export interface ChildEdge {
  readonly level: number;
  readonly border: string | null;
  readonly rim: RimHalf | null;
  readonly shadow: string | null;
}

/** The border of a child at `level` (the half step between this level and the next). */
export function childBorderHex(level: number): string {
  if (!Number.isInteger(level) || level < 1 || level > LADDER_B_TOP - 1) {
    throw new RangeError(`level ${level} has no border (needs a level above, 1..${LADDER_B_TOP - 1})`);
  }
  return level <= 3 ? BORDER_HALF_B[level] : computeBorderHalfHex(level);
}

/**
 * Edge treatment of a child placed at `parent + 1`.
 * `parent` is the level of the surface it sits on (0 = canvas, so the child is S1).
 */
export function childEdge(parent: number, styles: readonly ChildStyle[]): ChildEdge {
  if (!Number.isInteger(parent) || parent < 0 || parent >= LADDER_B_TOP) {
    throw new RangeError(`parent level ${parent} cannot hold a child (0..${LADDER_B_TOP - 1})`);
  }
  if (styles.length === 0) {
    throw new RangeError('a child needs one style (simple, bordered, shadowed or rimmed)');
  }
  if (styles.includes('simple') && styles.length > 1) {
    throw new RangeError('simple stands alone and cannot be combined');
  }
  const level = parent + 1;
  const has = (v: ChildStyle): boolean => styles.includes(v);
  if (has('rimmed') && (level === 5 || level === 6)) {
    throw new RangeError(`level ${level} rim is pending the ceiling decision`);
  }
  return {
    level,
    border: has('bordered') ? childBorderHex(level) : null,
    rim: has('rimmed') ? rimHalfHex(level) : null,
    shadow: has('shadowed') ? shadowCss(level) : null,
  };
}
