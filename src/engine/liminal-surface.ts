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
import { getDirectionalRim, SHADOWS, type DirectionalRimResult } from './spec-engine';
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
  | 'toast'; // the highest floating anchor

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
export const ROLE_RIM: Record<SurfaceRole, 0 | 1 | 2 | 3> = {
  canvas: 0,
  chrome: 1,
  work: 1,
  panel: 2,
  control: 2,
  menu: 2,
  popover: 3,
  modal: 3,
  toast: 3,
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
  const level = state === 'disabled'
    ? Math.max(0, anchored - 1)
    : Math.max(0, Math.min(MAX_LEVEL, anchored + depth + shift));

  // ── rim: from the role, suppressed when disabled ────────────────────────
  const rim: 0 | 1 | 2 | 3 = state === 'disabled' ? 0 : ROLE_RIM[role];
  const concave = state === 'active';
  const rimColors = rim === 0 ? null : getDirectionalRim(Math.round(level), rim, concave);

  // ── shadow: only for roles that float ───────────────────────────────────
  const shadowTier = elevation ?? ROLE_SHADOW[role];
  const shadow = shadowTier ? SHADOWS[shadowTier] : 'none';

  // ── focus ring: visible on keyboard focus, never on pointer focus ───────
  const outline = state === 'focus' ? `2px solid ${FOCUS_RING_COLOR}` : 'none';

  const interactive = role !== 'canvas' && role !== 'work' && role !== 'panel';

  const style: CSSProperties = {
    background: rimColors ? rimColors.cssBackground : getLadderVar(Math.round(level)),
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
    background: getLadderVar(Math.round(level)),
    // The computed value, for tests and the contract.
    backgroundHex: getLadderColor(Math.round(level)),
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
export type BorderKind = 'hairline' | 'edge';

interface BorderRequest {
  role: SurfaceRole;
  kind?: BorderKind;
  state?: SurfaceState;
  /** The surface this border sits on — see SurfaceRequest.on. */
  on?: SurfaceRole;
}

/** The ladder level a border lands on, before it is turned into a value. */
function borderLevel(request: BorderRequest): number {
  const { role, kind = 'hairline', state = 'idle' } = request;
  const anchored = request.on !== undefined ? ROLE_LEVEL[request.on] + CONTROL_LIFT : ROLE_LEVEL[role];
  // Clamp BEFORE deciding whether there is room above. Without this, a control
  // anchored on the toast lands at 8 + 1 = 9, `above` is 9.5, the inversion
  // computes 9 - 0.5 = 8.5 — which is STILL above the ceiling, so the border
  // came back as the surface colour and vanished. The inversion has to start
  // from the ceiling, not from a level that was never reachable.
  const base = Math.min(MAX_LEVEL, anchored + STATE_SHIFT[state]);
  const offset = kind === 'hairline' ? 0.5 : 1;
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
  /** A caller that needs its own idle fill, such as a brand or semantic colour. */
  idle?: string;
  /** A caller that needs its own border colour. */
  border?: string;
}

export function resolveInteractionVars(request: InteractionVarsRequest): InteractionVars {
  const { role, on, frozen, idle, border } = request;
  const at = (state: SurfaceState) => resolveSurface({ role, state, on }).background;

  const idleBg = idle ?? at('idle');
  // A frozen control — a checked box, a selected row — keeps its own fill in
  // every state. The same rule the contract states for hover on controls.
  const frozenBg = frozen ?? idleBg;

  return {
    '--liminal-surface-idle': idleBg,
    '--liminal-surface-hover': frozen ? frozenBg : at('hover'),
    '--liminal-surface-active': frozen ? frozenBg : at('active'),
    '--liminal-surface-focus': frozen ? frozenBg : at('focus'),
    '--liminal-border-idle': border ?? resolveBorder({ role, kind: 'edge', on }),
    '--liminal-border-focus': FOCUS_RING_COLOR,
  };
}
