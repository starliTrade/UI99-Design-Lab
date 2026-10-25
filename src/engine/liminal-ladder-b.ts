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
  // S5 is clipped to the ladder: its top is S6 itself (the last step), so no colour leaves the ladder.
  5: { top: '#171717', side: '#161616', bottom: '#151515' },
} as const;

/** The rim for a level. S1..S4 are half-step; S5 is clipped to the ladder top; S0 and S6 have none. */
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
 *   offset = 1px  ·  spread = 4px  ·  black at alpha 0.25  (candidate A, 2026-10-24)
 *
 * Earlier near (2/8/0.45) was judged too black and loud on children and was replaced.
 * The soft candidates were A (1/4/0.25), B (2/8/0.20), C (4/16/0.25), D (1/2/0.30).
 * A was chosen: the least darkness that still separates a layer from the one below.
 */
export interface ShadowSpec {
  readonly offsetY: number;
  readonly blur: number;
  readonly alpha: number;
}

export const SHADOW_NEAR_B: ShadowSpec = { offsetY: 1, blur: 4, alpha: 0.25 } as const;

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
/**
 * Hover colour. Levels 0..3: the half step up (the border colour).
 * Floating levels 4..5: the half step up as well (owner, 2026-10-24).
 * S6 (ceiling): no level above it, so hover is shadow-only (value pending, see policy 10).
 */
export function hoverHex(level: number): string {
  if (level === LADDER_B_TOP) {
    throw new RangeError(`level ${level} is the ceiling: hover is shadow-only, no colour`);
  }
  if (FLOATING_LEVELS_B.includes(level)) {
    return computeBorderHalfHex(level);
  }
  return borderHalfHex(level);
}

export function activeRim(level: number): RimHalf {
  return rimHalfHex(level);
}

/**
 * Disabled colour: half a step DOWN from the level.
 * Levels 1..3: the border colour of the level below.
 * Floating levels 4..6 (owner, 2026-10-24): the midpoint between the level and the one below.
 */
export function disabledHex(level: number): string {
  if (level < 1 || level > LADDER_B_TOP) {
    throw new RangeError(`level ${level} has no step below for a disabled surface`);
  }
  if (level >= 4) {
    return computeBorderHalfHex(level - 1);
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
 * Ceiling (decided 2026-10-24): S5 has a rim clipped to the ladder (top = S6).
 * S6 has no rim, because its half step would sit above the ladder top.
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
  if (has('rimmed') && level === 6) {
    throw new RangeError('level 6 has no rim: its half step would sit above the ladder top (ceiling rule)');
  }
  return {
    level,
    border: has('bordered') ? childBorderHex(level) : null,
    rim: has('rimmed') ? rimHalfHex(level) : null,
    shadow: has('shadowed') ? shadowCss(level) : null,
  };
}

/**
 * LIGHT — floating surfaces (decided 2026-10-24, owner's rule).
 *
 * The top of a floating surface is lighter than its bottom:
 *   - S4: top = half a step up (the S4..S5 midpoint), bottom = S4.
 *   - S5: top = half a step up (the S5..S6 midpoint), bottom = S5.
 *   - S6: flat. There is no level above S6 in the ladder, so no light is defined.
 *
 * Every light colour comes from the ladder (no colour leaves it).
 */
export interface LightSpec {
  readonly topHex: string;
  readonly bottomHex: string;
}

export function lightSpec(level: number): LightSpec | null {
  if (level === 4 || level === 5) {
    return { topHex: childBorderHex(level), bottomHex: ladderHex(level) };
  }
  if (level === 6) {
    return null;
  }
  throw new RangeError(`level ${level} is not a floating level (light is for S4..S6)`);
}

/** The CSS background for a floating surface. S6 is flat (null light). */
export function lightCss(level: number): string {
  const spec = lightSpec(level);
  if (spec === null) return ladderHex(level);
  return `linear-gradient(180deg, ${spec.topHex} 0%, ${spec.bottomHex} 100%)`;
}

/**
 * HALO — its own feature, separate from the rim (owner, 2026-10-24).
 *
 * A halo is a soft, light glow around an edge. It is NOT a rim and NOT one of
 * the four child styles. Its colour is white at a low alpha, never a free colour.
 * Three halos were approved by eye (H1, H2, H4). H3 was not approved.
 *
 *   soft:   0 0 6px 1px   rgba(255,255,255,0.03)   (H1)
 *   medium: 0 0 12px 2px  rgba(255,255,255,0.03)   (H2)
 *   wide:   0 0 16px 4px  rgba(255,255,255,0.02)   (H4)
 *
 * Which halo goes with which role is not decided yet.
 */
export interface HaloSpec {
  readonly blur: number;
  readonly spread: number;
  readonly alpha: number;
}

export const HALO_B = {
  soft: { blur: 6, spread: 1, alpha: 0.03 },
  medium: { blur: 12, spread: 2, alpha: 0.03 },
  wide: { blur: 16, spread: 4, alpha: 0.02 },
} as const satisfies Record<string, HaloSpec>;

export type HaloName = keyof typeof HALO_B;

/** The CSS box-shadow of a halo. Only approved names are accepted. */
export function haloCss(name: HaloName): string {
  if (!Object.prototype.hasOwnProperty.call(HALO_B, name)) {
    throw new RangeError(`halo "${name}" is not approved (soft, medium, wide)`);
  }
  const h = HALO_B[name];
  return `0 0 ${h.blur}px ${h.spread}px rgba(255,255,255,${h.alpha})`;
}

/**
 * HALO TARGETS — where a halo CAN be used (owner, 2026-10-24).
 *
 * A halo is a complete system piece. It is rarely used in practice, but every
 * element type must be able to take one, so the component layer can offer it
 * without a new rule. Any target may take any approved halo. No target has a
 * default halo: the default is none.
 */
export const HALO_TARGETS = [
  'surface',
  'card',
  'button',
  'input',
  'floating',
  'focus',
  'chip',
  'tab',
] as const;

export type HaloTarget = (typeof HALO_TARGETS)[number];

/** The halo that a target uses, or null (no halo, the default). */
export function haloFor(target: HaloTarget, name: HaloName | null): string | null {
  if (!(HALO_TARGETS as readonly string[]).includes(target)) {
    throw new RangeError(`target "${target}" is not a halo target`);
  }
  return name === null ? null : haloCss(name);
}

/**
 * MEASUREMENT — recorded results of the three-alternative forced-choice test
 * (design-lab/ladder-b-measure-test.html). Chance is 1/3.
 *
 * Session 1 and session 2 are both one observer on one device; they are kept as
 * recorded. The decision (owner, 2026-10-24) is that steps S4..S6 are separated
 * by border, rim or shadow, not by colour difference. The ladder values do not change.
 *
 * Status: "eye + system + formula" approved. No further repetition is planned.
 */
export const MEASUREMENT_B = {
  chance: 1 / 3,
  pairs: {
    'S0-S1': [12, 12],
    'S1-S2': [12, 12],
    'S2-S3': [12, 12],
    'S3-S4': [11, 9],
    'S4-S5': [10, 6],
    'S5-S6': [10, 3],
  },
  decision: 'S4..S6 are separated by border, rim or shadow (not by colour)',
} as const;
