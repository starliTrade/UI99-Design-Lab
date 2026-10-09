import type { CSSProperties } from 'react';

/**
 * LIMINAL · DESIGN SYSTEM — MASTER CONTRACT v1.0 (COMPLETE)
 * "هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر."
 * این سند، قرارداد کامل و قفل‌شده‌ی سیستم است. هیچ مقداری خارج از این سند مجاز نیست.
 */

export const LADDER = ['#060709', '#08090C', '#0A0B0F', '#0D0E12', '#101115', '#131418'] as const;
export const HALF = ['#07080B', '#090A0D', '#0B0C10', '#0E0F13', '#111216'] as const;

export const getLadderColor = (n: number): string => {
  n = Math.max(0, Math.min(5, n));
  return Number.isInteger(n) ? LADDER[n] : HALF[Math.floor(n)];
};

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

export function getLiminalStyle(el: LiminalStyleElement) {
  const baseN = Math.max(0, Math.min(5, el.surfaceLevel));
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
    n = Math.min(5, n + 0.5);
  }
  if (st === 'focus') {
    n = Math.min(5, n + 0.5);
    rim = 3;
    outline = `2px solid ${getLadderColor(baseN + 1)}`;
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

// 5) TEXT HIERARCHY (ΔL_text = 0.10, never pure white)
export const TEXT_HIERARCHY = {
  primary: 0.88,   // L ≈ 0.90
  secondary: 0.62, // L ≈ 0.80
  tertiary: {
    0: 0.40,
    1: 0.40,
    2: 0.45,
    3: 0.48,
    4: 0.50,
    5: 0.52,
  },
  quaternary: {
    0: 0.25,
    1: 0.25,
    2: 0.30,
    3: 0.33,
    4: 0.35,
    5: 0.37,
  },
} as const;

export function getTextAlpha(level: TextLevel, surfaceN: number = 0): number {
  const clampedN = Math.max(0, Math.min(5, Math.floor(surfaceN))) as 0 | 1 | 2 | 3 | 4 | 5;
  if (level === 'primary') return TEXT_HIERARCHY.primary;
  if (level === 'secondary') return TEXT_HIERARCHY.secondary;
  if (level === 'tertiary') return TEXT_HIERARCHY.tertiary[clampedN];
  return TEXT_HIERARCHY.quaternary[clampedN];
}

export function getTextStyle(level: TextLevel, surfaceN: number = 0): CSSProperties {
  const alpha = getTextAlpha(level, surfaceN);
  return {
    color: `rgba(255, 255, 255, ${alpha.toFixed(2)})`,
  };
}

