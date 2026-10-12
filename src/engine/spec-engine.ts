import type { CSSProperties } from 'react';
import { LADDER, HALF, getLadderColor, FOCUS_RING_COLOR } from './liminal-ladder';
import { resolveTextAlpha, type TextRole } from './liminal-contrast';

// Re-exported so existing imports keep working; the definitions live in
// liminal-ladder.ts, which has no dependencies and therefore cannot create a cycle.
export { LADDER, HALF, getLadderColor, FOCUS_RING_COLOR };

/**
 * LIMINAL · DESIGN SYSTEM — MASTER CONTRACT v1.0 (COMPLETE)
 * "هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر."
 * این سند، قرارداد کامل و قفل‌شده‌ی سیستم است. هیچ مقداری خارج از این سند مجاز نیست.
 */

export const RIM = {
  0: { t: 0, s: 0, b: 0 },
  1: { t: 0.5, s: 0.25, b: 0 },
  2: { t: 1.0, s: 0.5, b: 0 },
  3: { t: 1.5, s: 1.0, b: 0.5 },
} as const;

export interface DirectionalRimResult {
  top: string;
  side: string;
  bot: string;
  cssBackground: string;
  withBackground: (customBg: string) => string;
}

export function getDirectionalRim(
  n: number,
  rim: 0 | 1 | 2 | 3,
  concave: boolean = false
): DirectionalRimResult | null {
  if (rim === 0) return null;
  let top: string, side: string, bot: string;

  if (concave) {
    top = getLadderColor(n - 0.5);
    side = getLadderColor(n);
    bot = getLadderColor(n + 0.5);
  } else {
    top = getLadderColor(n + RIM[rim].t);
    side = getLadderColor(n + RIM[rim].s);
    bot = getLadderColor(n + RIM[rim].b);
  }

  const bg = getLadderColor(n);
  const gradStr = `linear-gradient(${bg}, ${bg}) padding-box, linear-gradient(180deg, ${top} 0%, ${side} 55%, ${bot} 100%) border-box`;

  return {
    top,
    side,
    bot,
    cssBackground: gradStr,
    withBackground: (customBg: string) =>
      `linear-gradient(${customBg}, ${customBg}) padding-box, linear-gradient(180deg, ${top} 0%, ${side} 55%, ${bot} 100%) border-box`,
  };
}

export const SHADOWS = {
  1: '0 2px 6px rgba(3,4,6,.30), 0 1px 2px rgba(1,2,3,.22)',
  2: '0 4px 12px rgba(3,4,6,.36), 0 2px 4px rgba(1,2,3,.26)',
  3: '0 8px 28px rgba(3,4,6,.44), 0 3px 8px rgba(1,2,3,.30)',
  4: '0 14px 44px rgba(3,4,6,.50), 0 5px 12px rgba(1,2,3,.34)',
} as const;

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

export const Z_INDEX = {
  dropdown: 1000,
  modal: 2000,
  tooltip: 3000,
  popover: 4000,
  floating: 9999, // برای Combobox/MultiSelect
} as const;

export type LiminalState = 'idle' | 'hover' | 'focus' | 'active' | 'disabled';
export type TextLevel = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

export interface LiminalStyleElement {
  surfaceLevel: number;
  containerLevel?: number;
  isContainer?: boolean;
  interactive?: boolean;
  isFeatured?: boolean;
  isFloating?: boolean;
  isInput?: boolean;
  elevation?: 1 | 2 | 3 | 4;
  state?: LiminalState;
  concave?: boolean;
}

/**
 * The deepest surface the ladder allows.
 *
 * Derived, never written down. This was a literal `5` in three places — correct
 * when the ladder had six steps, and silently wrong once it grew to nine.
 * Anything at S6, S7 or S8 was clamped onto S5, so `getLiminalStyle` could only
 * produce six distinct surfaces while `liminal-surface.resolveSurface` could
 * produce nine. Two engines, two answers for the same depth.
 *
 * A hard-coded ceiling is the same defect class as a hard-coded breakpoint: a
 * number that used to be right, left sitting where the thing it described has
 * changed underneath it.
 */
const MAX_SURFACE_LEVEL = LADDER.length - 1;

export function getLiminalStyle(el: LiminalStyleElement) {
  const baseN = Math.max(0, Math.min(MAX_SURFACE_LEVEL, el.surfaceLevel));
  let n = baseN;
  const container = el.containerLevel ?? Math.max(0, baseN - 1);
  let rim: 0 | 1 | 2 | 3 = el.isContainer ? 1 : (el.interactive || el.isFeatured) ? 2 : 0;
  let concave = el.concave ?? false;
  let outline = 'none';
  let outlineOffset = '0px';
  let transform = 'none';
  let opacity = 1;
  let cursor = el.isInput ? 'text' : el.interactive ? 'pointer' : 'default';
  let shadow = 'none';

  const st = el.state ?? 'idle';

  if (st === 'hover') {
    n = Math.min(MAX_SURFACE_LEVEL, n + 0.5);
  }
  if (st === 'focus') {
    n = Math.min(MAX_SURFACE_LEVEL, n + 0.5);
    rim = 3;
    outline = `2px solid ${FOCUS_RING_COLOR}`;
    outlineOffset = '2px';
  }
  if (st === 'active') {
    n = Math.max(0, n - 0.5);
    rim = 2;
    concave = true;
    transform = 'translateY(0.5px)';
  }
  if (st === 'disabled') {
    n = container;
    rim = 0;
    opacity = 0.25;
    cursor = 'not-allowed';
  }

  if (el.isFloating && el.elevation) {
    shadow = SHADOWS[el.elevation];
  } else if (el.isFeatured) {
    shadow = SHADOWS[2];
  }

  const rd = getDirectionalRim(n, rim, concave);

  return {
    n,
    bg: getLadderColor(n),
    rimLevel: rim,
    isConcave: concave,
    state: st,
    opacity,
    style: {
      background: rd ? rd.cssBackground : getLadderColor(n),
      border: rd ? '1px solid transparent' : 'none',
      boxShadow: shadow,
      outline,
      outlineOffset,
      transform,
      opacity,
      cursor,
    } as CSSProperties,
  };
}

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

