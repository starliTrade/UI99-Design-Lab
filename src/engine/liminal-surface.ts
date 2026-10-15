/**
 * LIMINAL · SURFACE DECISION ENGINE
 * «کدام عنصر، کجا، چقدر — و کجا هیچ‌چیز.»
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 *
 * Before this module, every component decided its own depth, rim and shadow by
 * calling getLadderColor(4) or hardcoding a rim tier. The audit found the
 * result: the toolbar sat at S2 while the nav directly beneath it sat at S1,
 * with no structural reason — two pieces of chrome, two different depths. There
 * was no rule, so there could be no consistency, and no test could catch it.
 *
 * This module is the rule. A component declares WHAT it is (a role) and what is
 * happening to it (a state); the engine decides the treatment. Nothing else
 * chooses a ladder level.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE MODEL
 *
 *   level = ROLE_LEVEL[role] + depth + STATE_SHIFT[state]
 *
 *   role   — what the element is in the hierarchy (fixed, one source)
 *   depth  — how deeply it is nested inside another surface (0 by default)
 *   state  — what is happening to it right now (shifts by a half-step)
 *
 * Then, from the role alone:
 *
 *   rim    — the directional specular edge that lifts the top of a surface
 *   shadow — only for elements that float above the flow
 *
 * The rules are asserted in __tests__/surface.test.ts. If a rule is not
 * asserted there, it is not a rule — it is a habit.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { CSSProperties } from 'react';
import { LADDER, getLadderColor, FOCUS_RING_COLOR, PERCEPTUAL_QUANTUM, getLadderVar } from './liminal-ladder';
import { oklchLightness } from './liminal-color-math';
import { getDirectionalRim, type DirectionalRimResult } from './spec-engine';
import { floatShadow } from './liminal-shadow';
import { LiminalMotionEngine } from './liminal-motion-engine';

/** What an element is in the hierarchy. */
export type SurfaceRole =
  | 'canvas' // the page itself
  | 'chrome' // nav, toolbar, tab bars — the frame around the work
  | 'work' // the work surface: panels, cards, the main content plane
  | 'panel' // a surface nested inside the work surface
  | 'control' // an interactive control that sits on a surface
  | 'menu' // a dropdown, tooltip or command list
  | 'popover' // a larger floating panel
  | 'modal' // a dialog or sheet that takes over the view
  | 'toast' // the highest floating anchor
  | 'well'; // the resting fill of a control that is OFF

/** What is happening to the element right now. */
export type SurfaceState = 'idle' | 'hover' | 'focus' | 'active' | 'disabled';

/**
 * ROLE → LADDER LEVEL. The single place a depth is decided.
 *
 * The ordering is the hierarchy itself: canvas at the bottom, toast at the top.
 * Each role is one step above the last, so the hierarchy is legible as a
 * sequence rather than a set of arbitrary numbers.
 */
export const ROLE_LEVEL: Record<SurfaceRole, number> = {
  canvas: 0,
  chrome: 1,
  work: 2,
  // A well sits at the WORK plane, not above it. It is the fill an unselected
  // control shows: the surface the control is cut into, with the defined edge
  // that still makes the control read as an object. Seven sites hand-picked
  // `getDirectionalRim(2, 2, …)` because the engine had no name for it.
  well: 2,
  panel: 3,
  control: 4,
  menu: 5,
  popover: 6,
  modal: 7,
  toast: 8,
};

/**
 * RIM TIER PER ROLE.
 *
 * The rim is the directional light on the top edge. It exists to separate a
 * surface from its parent, so it scales with how far the element sits above the
 * canvas:
 *   0 — no rim (the canvas itself, and anything disabled)
 *   1 — a quiet edge (chrome, the work surface)
 *   2 — a defined edge (panels, controls, menus)
 *   3 — a lifted edge (everything that floats high: popover, modal, toast)
 */
/**
 * RIM INTENSITY PER ROLE — and it is one tier LOWER than it was.
 *
 * Measured by eye, at three strengths on two hosts: the panel's rim at R2 is
 * loud, and at R1 it is at the threshold — on the work plane AND on the canvas.
 * The reader's answer was the same in both, which is why this is a shift of the
 * whole table rather than a special case for one host.
 *
 * AND THE SHIFT MAKES THE TABLE SAY WHAT IT SHOULD HAVE SAID. A rim is the light
 * a surface catches on its edge, and how much light it catches depends on how far
 * it sits above what it is on. The old table gave a panel the same tier as a menu
 * — two steps of rim for one step of height. Now the tier follows the height:
 *
 *   0  structural — chrome and work DEFINE the frame and the plane; they do not
 *      sit on anything, so they catch no edge light
 *   1  one step above its host — a panel on the work plane, a control on whatever
 *      hosts it, a menu over the plane
 *   2  floating — a popover, a modal, a toast
 *
 * The reader chose "relative to its OWN surface" over "relative to the
 * neighbour", so the rule stays physical: the rim is a light on the edge, not a
 * separator. What changed is how bright the light is.
 */
export const ROLE_RIM: Record<SurfaceRole, 0 | 1 | 2 | 3> = {
  canvas: 0,
  chrome: 0,
  work: 0,
  well: 1,
  panel: 1,
  control: 1,
  menu: 1,
  popover: 2,
  modal: 2,
  toast: 2,
};

/**
 * SHADOW ELEVATION PER ROLE.
 *
 * A shadow means "this floats above the flow". Nothing that sits *in* the flow
 * gets one — that is the whole point of the rule. `null` means no shadow.
 *
 *   E1 — a dropdown or sticky header
 *   E2 — a featured card or popover
 *   E3 — a modal or sheet
 *   E4 — a toast, the highest anchor
 */
export const ROLE_SHADOW: Record<SurfaceRole, 1 | 2 | 3 | 4 | null> = {
  canvas: null,
  chrome: null, // chrome is part of the frame, not floating above it
  work: null,
  well: null, // a well is cut into the flow; nothing in the flow floats
  panel: null,
  control: null,
  menu: 1,
  popover: 2,
  modal: 3,
  toast: 4,
};

/** Roles that float above the flow, and therefore may cast a shadow. */
export const FLOATING_ROLES: readonly SurfaceRole[] = ['menu', 'popover', 'modal', 'toast'];

/**
 * THE FLOATING SHADOWS, NAMED BY ROLE.
 *
 * They were `SHADOWS[1..4]` — four numbers with no meaning, described in comments
 * as "dropdown, header", "featured card, popover". A number that needs a comment
 * to say what it is for is a name that has not been written yet.
 *
 * These are a VIEW of the one model in `liminal-shadow.ts`, evaluated at each
 * floating role's own height, so they cannot disagree with what the mist layer
 * draws for the same role.
 */
export const FLOAT_SHADOWS = Object.fromEntries(
  FLOATING_ROLES.map((role) => [role, floatShadow(ROLE_LEVEL[role])]),
) as Record<(typeof FLOATING_ROLES)[number], string>;

/**
 * STATE SHIFT, in ladder steps.
 *
 * A state change is deliberately a HALF step (~0.6q), which is below the
 * perceptual quantum: a hover should be *felt*, not *seen*. If it were a full
 * step it would compete with the hierarchy itself.
 */
export const STATE_SHIFT: Record<SurfaceState, number> = {
  idle: 0,
  hover: 0.5,
  focus: 0.5,
  active: -0.5,
  disabled: 0,
};

export interface SurfaceRequest {
  role: SurfaceRole;
  state?: SurfaceState;
  /** How deeply nested inside another surface. Each level adds one step. */
  depth?: number;
  /** Override the shadow elevation for a role that floats. */
  elevation?: 1 | 2 | 3 | 4;
  /**
   * Cut this surface INTO its host rather than raising it above.
   *
   * One and a half steps below the role, rim 2, concave. That is the shape an
   * empty-state container, a code block and a pressed control all share, and it
   * was hand-picked as `getDirectionalRim(1.5, 2, true)` in three places.
   */
  inset?: boolean;
  /**
   * Whether this surface answers the pointer.
   *
   * It decides one thing — the cursor — and the role cannot decide it, because
   * a role is a DEPTH and a depth can be used either way. `chrome` is the level
   * the nav frame sits at AND the level a NavItem sits at: one is a container
   * you cannot click, the other is a control you can. The old resolver took
   * `interactive` for exactly this reason; without it, migrating the five
   * structural containers to `role: 'chrome'` would have given the sidebar and
   * the tab bar a hand cursor.
   *
   * Defaults to true for every role except the structural ones.
   */
  interactive?: boolean;
  /**
   * The surface this element sits ON.
   *
   * This is what makes a control behave correctly anywhere. Without it, a
   * control is pinned to its own absolute level: measured, an input on the
   * canvas sat 4.75q above it (a jarring jump) while the same input on a modal
   * sat 3.29q BELOW it (sunken into its own host). Neither was a rule — both
   * were accidents of using absolute levels for a relative relationship.
   *
   * With `on`, the control is placed one step above whatever hosts it, so the
   * relationship is the same at every depth.
   */
  on?: SurfaceRole;
}

/**
 * How far a control sits above the surface that hosts it, in ladder steps.
 * One step (~1.1q) — above the perceptual quantum, so the control reads as a
 * distinct object, but not so far that it looks detached from its host.
 */
export const CONTROL_LIFT = 1;

/**
 * THE NESTING FLOOR — how far a child must sit from its host to read as a layer.
 *
 * Measured by eye, and then explained by a measurement that already existed.
 *
 * A nested child is not a flat patch. It is a BOUNDED region, and what makes it
 * read as a region is its BOUNDARY — an edge. So the nesting threshold is
 * governed by the EDGE threshold (measured at 0.0040, about 0.48q), NOT by the
 * flat-surface threshold q. That is why a child can read as a layer at a
 * distance that would be invisible as a flat patch: 0.5 steps is 0.00474, which
 * is BELOW q and ABOVE the edge threshold.
 *
 *   the ladder's step     0.009475 / q           = 1.14x
 *   the border's offset   0.004738 / edge        = 1.18x
 *   this floor            0.004738 / edge        = 1.18x
 *
 * Three mechanisms, three thresholds, one ratio: every layer-to-layer signal sits
 * about 1.15x above the threshold of whatever mechanism reads it.
 *
 * AND THE SYSTEM USES TWICE THE FLOOR, ON PURPOSE. `CONTROL_LIFT` is one step —
 * 2x this floor — because a floor is a BOUND, not a target: a nested control has
 * to be READABLE, not merely detectable. The floor is what a nesting may never go
 * below; the working value is what it should be.
 *
 * The two signals are independent, and the eye test settled both:
 *
 *   the BOUNDARY  a border, which says a region exists. It alone is enough —
 *                 a child at ZERO offset, the exact colour of its host, reads as
 *                 a region when it has one.
 *   the DIRECTION a fill difference, which says the region is raised or sunk.
 *
 * The sunk direction is NOT harder to see: measured by eye, a well one step down
 * and a control one step up are equally clear. So the asymmetry in
 * `resolveInset` (one and a half steps) is STRUCTURAL — it lands the well between
 * the canvas and chrome rather than inventing a value — and it must be read as
 * such, not as a perceptual requirement.
 */
export const NEST_MIN = 0.5;

export interface SurfaceResolution {
  /** The resolved ladder level (may be fractional). */
  level: number;
  /** The resolved background colour. */
  /** A CSS value a component can use: a variable reference, so it follows a theme. */
  background: string;
  /** The same surface as a hex, for tests and the contract. */
  backgroundHex: string;
  /** The rim tier actually applied. */
  rim: 0 | 1 | 2 | 3;
  /** The rim's resolved top/side/bottom colours, when a rim applies. */
  rimColors: DirectionalRimResult | null;
  /** The shadow string, or 'none'. */
  shadow: string;
  /** The focus ring, or 'none'. */
  outline: string;
  /** Whether the element is interactive at all. */
  interactive: boolean;
  /** The full style object, ready to spread onto an element. */
  style: CSSProperties;
}

const MAX_LEVEL = LADDER.length - 1;

/**
 * Resolve the complete treatment for a surface.
 *
 * This is the only function a component should call to decide its depth, rim
 * and shadow. Everything else is a rule that lives here.
 */
export function resolveSurface(request: SurfaceRequest): SurfaceResolution {
  const { role, state = 'idle', depth = 0, elevation } = request;

  const base = ROLE_LEVEL[role];
  const shift = STATE_SHIFT[state];

  // ── level: host + lift when a host is given, otherwise the role's own ───
  // A control is defined by its RELATIONSHIP to what hosts it, not by an
  // absolute level. Without `on`, the role's fixed level is used, which is
  // correct for structural surfaces (chrome, work, panel) that define the
  // hierarchy rather than sit inside it.
  const anchored = request.on !== undefined
    ? ROLE_LEVEL[request.on] + CONTROL_LIFT
    : base;

  // A disabled element drops to its parent's level: it is present but inert.
  // An inset is cut one and a half steps below — between the canvas and chrome,
  // which is where a well belongs.
  //
  // ── THE CEILING INVERTS ──────────────────────────────────────────────────
  // A positive shift at the ceiling has nowhere to go. Rounding used to hide
  // that: 8 + 0.5 became 8, so a hover on a toast did nothing at all. Now that
  // the half-step is kept, the shift would run off the ladder — so it inverts
  // and goes DOWN, which is what `resolveBorder` has always done at the ceiling.
  // A separator becomes a shadow; a hover becomes a press.
  // ── CLAMP THE ANCHOR FIRST ───────────────────────────────────────────────
  // A control anchored on the toast lands at 8 + 1 = 9 — a level that was never
  // reachable. `resolveBorder` already learned this: "the inversion has to start
  // from the ceiling, not from a level that was never reachable". Without the
  // clamp, 9 − 0.5 = 8.5 clamps back to 8 and the state becomes a no-op.
  const ceiling = Math.min(MAX_LEVEL, anchored);
  const shifted = ceiling + depth + shift;
  const level = state === 'disabled'
    ? Math.max(0, ceiling - 1)
    : request.inset
    ? Math.max(0, ceiling - 1.5)
    : shifted > MAX_LEVEL && shift > 0
    ? // At the ceiling a positive shift has nowhere to go, so it goes DOWN.
      // A hover at the top of the ladder becomes a press.
      Math.max(0, MAX_LEVEL - shift)
    : shifted < 0 && shift < 0
    ? // And at the floor it goes UP, which is the same rule seen from the
      // other end. The canvas is the only role that reaches it.
      Math.min(MAX_LEVEL, 0 - shift)
    : Math.max(0, Math.min(MAX_LEVEL, shifted));

  // ── rim: from the role, suppressed when disabled ────────────────────────
  // An inset takes a defined edge whatever its role: the well has to read as a
  // cut, and a quiet seam would not.
  const rim: 0 | 1 | 2 | 3 = state === 'disabled' ? 0 : request.inset ? 2 : ROLE_RIM[role];
  const concave = state === 'active' || request.inset === true;
  // The rim follows the LEVEL, including its half — a hovered surface's edge
  // moves with its fill. Rounding here would leave the edge behind.
  const rimColors = rim === 0 ? null : getDirectionalRim(level, rim, concave);

  // ── shadow: only for roles that float ───────────────────────────────────
  const shadowTier = elevation ?? ROLE_SHADOW[role];
  // The shadow comes from the role's own HEIGHT, so a surface cannot be given a
  // shadow that disagrees with the one the mist layer would draw for it.
  const shadow = shadowTier ? floatShadow(ROLE_LEVEL[role]) : 'none';

  // ── focus ring: visible on keyboard focus, never on pointer focus ───────
  const outline = state === 'focus' ? `2px solid ${FOCUS_RING_COLOR}` : 'none';

  const interactive =
    request.interactive ?? !['canvas', 'work', 'well', 'panel'].includes(role);

  const style: CSSProperties = {
    background: rimColors ? rimColors.cssBackground : getLadderVar(level),
    border: rimColors ? '1px solid transparent' : 'none',
    boxShadow: shadow,
    outline,
    outlineOffset: outline === 'none' ? undefined : '2px',
    opacity: state === 'disabled' ? 0.25 : 1,
    cursor: state === 'disabled' ? 'not-allowed' : interactive ? 'pointer' : 'default',
    transform: concave ? 'translateY(0.5px)' : undefined,
    transition: LiminalMotionEngine.TRANSITION.normal,
    boxSizing: 'border-box',
  };

  return {
    level,
    // The style-facing value reads the CSS layer, so it follows a theme.
    //
    // NOT rounded. `HALF` exists — the ladder publishes eight half-steps and
    // its own comment says they are "used for state changes (hover / active)",
    // "deliberately below the threshold: a state change should be felt, not
    // seen". `resolveSurface` rounded the level anyway, so a half-step shift
    // landed either a FULL quantum away (visible) or exactly on the idle fill
    // (invisible). It broke the system's first rule in every role.
    background: getLadderVar(level),
    // The computed value, for tests and the contract.
    backgroundHex: getLadderColor(level),
    rim,
    rimColors,
    shadow,
    outline,
    interactive,
    style,
  };
}

/**
 * The depth a role sits at relative to the canvas, in ladder steps.
 * Useful for asserting the hierarchy in tests and for documentation.
 */
export function roleDepthInSteps(role: SurfaceRole): number {
  return ROLE_LEVEL[role];
}

/**
 * BORDER RULE.
 *
 * A border is not a decoration — it is a separator, and how strong it should be
 * depends on what it separates. Two kinds, both derived from the surface they
 * sit on rather than chosen per component:
 *
 *   hairline — one HALF step above the surface. For separators inside a surface:
 *              table row dividers, a topbar's bottom edge, a footer's top edge.
 *              Deliberately below the perceptual quantum, so it reads as a seam
 *              rather than as a line.
 *
 *   edge     — one FULL step above the surface. For the outline of a control
 *              that must read as a distinct object: inputs, outline buttons,
 *              calendar cells. Above the quantum, so it is reliably visible.
 *
 * Both are computed from the role's own level, so a divider on a popover is
 * automatically stronger than one on the work surface — which is what the eye
 * expects, and what 19 hand-chosen numbers could not express.
 *
 * EDGE CASE — the ceiling. The toast sits at S8, the top of the ladder, so
 * there is no room above it. Rather than silently returning the surface colour
 * (which would make the border invisible), the border inverts and goes one step
 * BELOW: at the ceiling a separator is a shadow, not a highlight.
 */
export type BorderKind = 'separator' | 'edge';

interface BorderRequest {
  role: SurfaceRole;
  kind?: BorderKind;
  state?: SurfaceState;
  /** The surface this border sits on — see SurfaceRequest.on. */
  on?: SurfaceRole;
}

/** The ladder level a border lands on, before it is turned into a value. */
function borderLevel(request: BorderRequest): number {
  const { role, kind = 'separator', state = 'idle' } = request;
  const anchored = request.on !== undefined ? ROLE_LEVEL[request.on] + CONTROL_LIFT : ROLE_LEVEL[role];
  // Clamp BEFORE deciding whether there is room above. Without this, a control
  // anchored on the toast lands at 8 + 1 = 9, `above` is 9.5, the inversion
  // computes 9 - 0.5 = 8.5 — which is STILL above the ceiling, so the border
  // came back as the surface colour and vanished. The inversion has to start
  // from the ceiling, not from a level that was never reachable.
  const base = Math.min(MAX_LEVEL, anchored + STATE_SHIFT[state]);
  /**
   * TWO JOBS, TWO DISTANCES — and the names say which is which.
   *
   *   separator  0.5 steps = 0.57q   a line between two regions of the SAME
   *                                  surface. It sits at the threshold: you feel
   *                                  the division without reading a line.
   *   edge       1.0 steps = 1.14q   the boundary of a surface against what it
   *                                  sits on. It is TWICE the threshold, on
   *                                  purpose.
   *
   * AND THE SECOND ONE WAS MEASURED, NOT CHOSEN. The reader's argument: "if we
   * want to keep the logic and the meaning of a border, we have to choose one full
   * step — because at anything less, even a border is not a border." The numbers
   * agree: half a step is 0.57q against an edge threshold of 0.48q — 1.18x, a
   * HINT. A whole step is 1.14q — 2.4x, a BORDER.
   *
   * It was called `hairline`, which named a style rather than a job, and that is
   * how a surface's boundary ended up drawn at the separator's strength in several
   * components. The name is the rule now.
   */
  const offset = kind === 'separator' ? 0.5 : 1;
  const above = base + offset;
  // At the ceiling there is no room above, so the border inverts and goes below.
  return above > MAX_LEVEL ? Math.max(0, base - offset) : above;
}

export function resolveBorder(request: BorderRequest): string {
  // A variable, so a border follows a theme like everything else that is drawn.
  return getLadderVar(borderLevel(request));
}

/**
 * The same border as a hex.
 *
 * The engine has two kinds of output: a value for arithmetic, tests and the
 * contract, and a value for a style object. The first is a hex, the second is a
 * variable reference — and only the second follows a theme.
 */
export function resolveBorderHex(request: BorderRequest): string {
  return getLadderColor(borderLevel(request));
}

/**
 * THE BORDER'S LEVEL — the primitive both outputs come from.
 *
 * `resolveBorder` turns it into a `var()` reference and `resolveBorderHex` into a
 * hex, and those two are no longer the same number: the stylesheet publishes the
 * ladder exactly (see `LADDER_EXACT`), so a border drawn from the variable is
 * exact while a border drawn from the hex carries the display's rounding.
 *
 * That is why a test measuring `resolveBorderHex` finds the edge at 2.098 times
 * the separator instead of 2.0 — the ratio is exact in the system and quantised in
 * the hex. Measuring the LEVEL is measuring the system.
 */
export function resolveBorderLevel(request: BorderRequest): number {
  return borderLevel(request);
}

/**
 * INSET WELL RULE.
 *
 * A well is the opposite of a raised surface: a region that reads as *below*
 * its parent — an empty-state container, a concave pressed control, a code
 * block. It sits one and a half steps BELOW the role it is cut into, which
 * lands it between the canvas and chrome rather than inventing a value.
 */
export function resolveInset(request: { role: SurfaceRole }): string {
  const base = ROLE_LEVEL[request.role];
  return getLadderVar(Math.max(0, base - 1.5));
}

/** A 1px border declaration for the given role and kind. */
export function resolveBorderStyle(request: {
  role: SurfaceRole;
  kind?: BorderKind;
  state?: SurfaceState;
}): CSSProperties {
  return { border: `1px solid ${resolveBorder(request)}` };
}

/**
 * The depth a role sits at relative to the canvas, in perceptual quanta.
 * This is the number that matters: it says how many thresholds of separation
 * the user actually perceives. The work surface, for example, sits at ~2.5q.
 */
export function roleDepthInQuanta(role: SurfaceRole): number {
  const canvasL = oklchLightness(LADDER[0]);
  const roleL = oklchLightness(LADDER[ROLE_LEVEL[role]]);
  return (roleL - canvasL) / PERCEPTUAL_QUANTUM;
}

/**
 * THE INTERACTION VARIABLES, FROM THE ENGINE.
 *
 * The CSS layer reads `--liminal-surface-{idle,hover,active,focus}` and
 * `--liminal-border-{idle,focus}`. Until now NO engine module produced them:
 * every component hand-assembled them, twelve-plus sites, often by calling
 * `resolveSurface` two or three times in a row.
 *
 * That is not only repetition. It is the mechanism behind two real bugs this
 * session: a component that hand-builds the variables can publish a HOVER value
 * and forget the IDLE one, or set `background` inline beside them and cancel the
 * rule that reads them. One producer removes the class.
 */
export interface InteractionVars {
  '--liminal-surface-idle': string;
  '--liminal-surface-hover': string;
  '--liminal-surface-active': string;
  '--liminal-surface-focus': string;
  '--liminal-border-idle': string;
  '--liminal-border-focus': string;
}

export interface InteractionVarsRequest {
  role: SurfaceRole;
  /** The surface this control sits on. */
  on?: SurfaceRole;
  /** Freeze the control in one state — a checked box keeps its fill on hover. */
  frozen?: string;
  /**
   * The resting fill, when it is not the engine's control surface: a brand or
   * semantic colour, a rim gradient, or `transparent` for a control that lies
   * flat on its host.
   *
   * A caller that supplies `idle` should supply `hover` and `active` with it.
   * The engine derives the two from the level its OWN fill sits at, and it
   * cannot know what half a step means for a colour it did not choose — a
   * brand's own hover, or a flat control whose press returns to the host.
   */
  idle?: string;
  /** The hover fill, when `idle` is the caller's own. */
  hover?: string;
  /** The pressed fill, when `idle` is the caller's own. */
  active?: string;
  /** A caller that needs its own border colour. */
  border?: string;
  /** A caller that needs its own focus border — an invalid field turns red. */
  borderFocus?: string;
}

export function resolveInteractionVars(request: InteractionVarsRequest): InteractionVars {
  const { role, on, frozen, idle, hover, active, border, borderFocus } = request;
  const at = (state: SurfaceState) => resolveSurface({ role, state, on }).background;

  const idleBg = idle ?? at('idle');
  // A frozen control — a checked box, a selected row — keeps its own fill in
  // every state. The same rule the contract states for hover on controls.
  const frozenBg = frozen ?? idleBg;

  return {
    '--liminal-surface-idle': idleBg,
    '--liminal-surface-hover': hover ?? (frozen ? frozenBg : at('hover')),
    '--liminal-surface-active': active ?? (frozen ? frozenBg : at('active')),
    '--liminal-surface-focus': frozen ? frozenBg : at('focus'),
    '--liminal-border-idle': border ?? resolveBorder({ role, kind: 'edge', on }),
    '--liminal-border-focus': borderFocus ?? FOCUS_RING_COLOR,
  };
}
