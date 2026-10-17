import type { CSSProperties } from 'react';
import { LADDER, HALF, getLadderColor, getLadderColorExact, getLadderVar, FOCUS_RING_COLOR } from './liminal-ladder';
import { resolveTextAlpha, type TextRole } from './liminal-contrast';

// Re-exported so existing imports keep working; the definitions live in
// liminal-ladder.ts, which has no dependencies and therefore cannot create a cycle.
export { LADDER, HALF, getLadderColor, getLadderVar, FOCUS_RING_COLOR };

/**
 * LIMINAL · DESIGN SYSTEM — MASTER CONTRACT v1.0 (COMPLETE)
 * "هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر."
 * این سند، قرارداد کامل و قفل‌شده‌ی سیستم است. هیچ مقداری خارج از این سند مجاز نیست.
 */

/**
 * THE RIM — ONE STRENGTH, AND IT IS A LIGHT.
 *
 *   top    +1.5 steps = 1.71q   2.73x the edge threshold
 *   side   +1.0 steps = 1.14q
 *   bottom +0.5 steps = 0.57q
 *
 * It was four tiers — 0, 0.5, 1, 1.5 — and a role table that picked one. Measured by
 * eye at three boundaries, the reader's answer was the same at all of them: 1.5. "For
 * the essence and the principles of the rim, along with being LIMINAL, my eye is
 * stuck on 1.5."
 *
 * AND ONE STRENGTH IS WHAT THE SYSTEM ALREADY DOES EVERYWHERE ELSE:
 *
 *   separator   0.5 steps   a hint
 *   edge        1.0 steps   a border
 *   rim         1.5 steps   a light
 *   shadow      1 quantum   a shadow
 *
 * Each treatment has exactly one strength, and the three edge treatments sit one step
 * apart. A table of tiers implied a choice that, measured, was not there.
 */
export const RIM = { t: 1.5, s: 1.0, b: 0.5 } as const;

export interface DirectionalRimResult {
  top: string;
  side: string;
  bot: string;
  /** The gradient a component uses: built from CSS variables, so it follows a theme. */
  cssBackground: string;
  /** The same gradient built from hexes, for tests and the contract. */
  cssBackgroundHex: string;
  withBackground: (customBg: string) => string;
}

export function getDirectionalRim(
  n: number,
  hasRim: boolean,
  concave: boolean = false
): DirectionalRimResult | null {
  if (!hasRim) return null;
  let top: string, side: string, bot: string;

  // At the ceiling there is no room above, so the rim INVERTS and lights from
  // below — the same rule the border already follows. Without it a surface at
  // the ceiling got a flat rim: measured, a toast's top, side and bottom all
  // resolved to `#15171a`, which is the surface itself. The rim was invisible
  // and nothing said so.
  const MAX = LADDER.length - 1;
  const room = MAX - n;
  const atCeiling = room <= 0;
  /**
   * WHEN THERE IS ROOM BUT NOT ENOUGH, THE RIM SCALES — IT DOES NOT INVERT.
   *
   * The rim's top sits 1.5 steps above its surface, so a surface at S7 has 1 step of
   * room and a surface at S8 has none. The old rule inverted whenever `n + 1.5` went
   * past the ceiling, which meant the MODAL — one step below the top — got a rim
   * DARKER than its own surface: measured, S7's top resolved to #121417 against a
   * surface of #131518. A dark edge reads as CUT IN, which is the opposite of what a
   * raised surface should say.
   *
   * So the shape is scaled to the room available and only the DIRECTION is kept: at
   * S7 the rim is 1 / 0.67 / 0.33 instead of 1.5 / 1 / 0.5. And a surface with no
   * room at all — the toast — still inverts, because below is the only direction left.
   */
  const scale = atCeiling ? 0 : Math.min(1, room / RIM.t);

  if (concave) {
    top = getLadderColor(n - 0.5);
    side = getLadderColor(n);
    bot = getLadderColor(n + 0.5);
  } else if (atCeiling) {
    top = getLadderColor(n - RIM.b);
    side = getLadderColor(n - RIM.s);
    bot = getLadderColor(n - RIM.t);
  } else {
    top = getLadderColor(n + RIM.t * scale);
    side = getLadderColor(n + RIM.s * scale);
    bot = getLadderColor(n + RIM.b * scale);
  }

  const bg = getLadderColor(n);
  const gradStr = `linear-gradient(${bg}, ${bg}) padding-box, linear-gradient(180deg, ${top} 0%, ${side} 55%, ${bot} 100%) border-box`;

  // The same gradient built from VARIABLES. `top`/`side`/`bot` stay hexes —
  // they are the computed values the contract and the tests read — while the
  // gradient a component puts in a style object reads the CSS layer, so it
  // follows a theme.
  // EXACT, not rounded: a compressed rim has to keep three distinct stops.
  const vTop = getLadderColorExact(concave ? n - 0.5 : atCeiling ? n - RIM.b : n + RIM.t * scale);
  const vSide = getLadderColorExact(concave ? n : atCeiling ? n - RIM.s : n + RIM.s * scale);
  const vBot = getLadderColorExact(concave ? n + 0.5 : atCeiling ? n - RIM.t : n + RIM.b * scale);
  const vBg = getLadderVar(n);
  const gradVar = `linear-gradient(${vBg}, ${vBg}) padding-box, linear-gradient(180deg, ${vTop} 0%, ${vSide} 55%, ${vBot} 100%) border-box`;

  return {
    top,
    side,
    bot,
    cssBackground: gradVar,
    cssBackgroundHex: gradStr,
    withBackground: (customBg: string) =>
      `linear-gradient(${customBg}, ${customBg}) padding-box, linear-gradient(180deg, ${top} 0%, ${side} 55%, ${bot} 100%) border-box`,
  };
}

/**
 * THE SHADOW SCALE IS GONE — see `liminal-shadow.ts` for the one model.
 *
 * A floating surface takes `floatShadow(height)`; an object resting on a surface
 * takes `REST_SHADOW`. There is no `SHADOWS[1..4]` any more, because that record
 * was the second answer to a question that already had one.
 */

/**
 * SURFACE TINTS — white laid over a surface to lift it.
 *
 * These replaced six ad-hoc alphas (0.01, 0.03, 0.04, 0.06, 0.08, 0.20) that
 * had been invented locally in components. A tint is not a text level: it is a
 * *fill*, so it does not belong in the text hierarchy and must not be used for
 * type (its contrast is far below any text floor).
 *
 * Four steps, each with one job. If a fifth is needed, the need is the bug.
 */
export const SURFACE_TINT = {
  /** Barely-there: inset wells, nested card fills. */
  faint: 'rgba(255, 255, 255, 0.01)',
  /** Subtle: hover on ghost/outline controls, quiet chips, hairlines. */
  subtle: 'rgba(255, 255, 255, 0.03)',
  /** Medium: badges, active outline controls, compact action hover. */
  medium: 'rgba(255, 255, 255, 0.06)',
  /** Strong: small affordances only — drawer handles, dots, separators. */
  strong: 'rgba(255, 255, 255, 0.20)',
  /** Solid: control parts that must stay legible — toggle knobs, slider thumbs. */
  solid: 'rgba(255, 255, 255, 0.40)',
} as const;

/**
 * VEILS — a surface laid over content to push it back.
 *
 * Veils are built from the sub-canvas wells, never from grey: the backdrop must
 * read as *depth*, not as a colour.
 */
export const VEIL = {
  /** Behind modals, sheets and the command palette. S-1 Penumbra at 0.60. */
  backdrop: 'rgba(3, 4, 6, 0.60)',
  /** Sticky header floating over scrolling content. S0 Canvas at 0.85. */
  canvas: 'rgba(6, 7, 9, 0.85)',
} as const;

/** Brand laid over a surface — for quiet brand-tinted fills. */
export const BRAND_ALPHA = {
  subtle: 'rgba(233, 236, 242, 0.08)',
} as const;

/**
 * Z-INDEX IS THE LADDER LEVEL — it is not a second system.
 *
 * It was five hand-picked round numbers — 1000, 2000, 3000, 4000, 9999 — and it was the one
 * place in this engine where a number carried no information. An eye test settled it by
 * showing NOTHING: four stages, the round numbers and `z = level` and `z = level × 10` and
 * `z = level` with a stacking context, and all four looked identical. Which is the finding —
 * the VALUES do not matter, the ORDER does, and the order is the layer hierarchy the engine
 * already has.
 *
 *   panel S3 < menu S5 < modal S7 < toast S8
 *
 * So a surface's stacking order IS its level, and there is nothing to choose.
 *
 * AND EVERY SURFACE CREATES A STACKING CONTEXT, which is the half that removes the most magic.
 * With `isolation: isolate` on each surface, a CHILD is above its parent by construction, so a
 * dropdown inside a modal needs no number at all — it is inside the modal's context. z-index
 * then only has to order SIBLINGS, which is what the level already does.
 */
export const Z_INDEX = {
  canvas: 0, chrome: 1, work: 2, panel: 3, control: 4,
  menu: 5, popover: 6, modal: 7, toast: 8,
  // The two names the components used, kept as aliases so nothing breaks — and both now
  // resolve to a ladder level rather than to a round number.
  dropdown: 5,
  tooltip: 6,
  floating: 5,
} as const;

export type LiminalState = 'idle' | 'hover' | 'focus' | 'active' | 'disabled';
export type TextLevel = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

/**
 * THE DEPTH API WAS HERE, AND IT IS GONE.
 *
 * `getLiminalStyle({ surfaceLevel })` took a raw depth and returned a surface.
 * `liminal-surface.resolveSurface({ role })` takes a ROLE and returns one. They
 * disagreed: at level 3 the old one still drew a rim of 1, which the contract
 * says belongs to chrome and work, while the new one draws 2. Two answers for
 * the same depth, and a component could pick either.
 *
 * Every call site now declares what it IS — `role: 'chrome'`, `role: 'work'`,
 * `role: 'panel'` — and the governing principle already said why: values become
 * tokens, selections become names, raw numbers are forbidden.
 *
 * The rule that made this a defect rather than a preference: a hard-coded
 * ceiling (`Math.min(5, ...)`) outlived the ladder growing to nine steps, so
 * S6, S7 and S8 were silently flattened onto S5.
 */

// 5) TEXT HIERARCHY — DERIVED, NOT HAND-PICKED
//
// The alphas below are computed from the floors in liminal-contrast.ts, which
// are themselves derived from each role's declared use. They are not chosen.
//
//   primary    Lc 90  — body-preferred
//   secondary  Lc 75  — body-minimum
//   tertiary   Lc 75  — body-minimum (same floor as secondary by design)
//   quaternary Lc 30  — non-text marks only
//
// secondary and tertiary therefore share one alpha. Their hierarchy lives in
// size and weight, not in colour. See DESIGN-CONTRACT.md §4.
//
// The table is recomputed per surface, because the floor is a property of the
// surface the text sits on, not a global constant.
const TEXT_SURFACES = LADDER;

function deriveAlpha(role: TextRole, surface: string): number {
  return resolveTextAlpha(role, surface);
}

export const TEXT_HIERARCHY = {
  primary: TEXT_SURFACES.map((s) => deriveAlpha('primary', s)),
  secondary: TEXT_SURFACES.map((s) => deriveAlpha('secondary', s)),
  tertiary: TEXT_SURFACES.map((s) => deriveAlpha('tertiary', s)),
  quaternary: TEXT_SURFACES.map((s) => deriveAlpha('quaternary', s)),
} as const;

export function getTextAlpha(level: TextLevel, surfaceN: number = 0): number {
  const n = Math.max(0, Math.min(TEXT_HIERARCHY.primary.length - 1, Math.floor(surfaceN)));
  return TEXT_HIERARCHY[level][n];
}

export function getTextStyle(level: TextLevel, surfaceN: number = 0): CSSProperties {
  const alpha = getTextAlpha(level, surfaceN);
  return {
    color: `rgba(255, 255, 255, ${alpha.toFixed(2)})`,
  };
}

export { getFocusRing } from './liminal-component-engine';

