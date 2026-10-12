import type { CSSProperties } from 'react';

/**
 * LIMINAL SPACING · RADIUS · TYPOGRAPHY — LOCKED SPEC v1.0
 * Layout, Geometry, and Typography Engine.
 */

export interface TypeLevel {
  fs: number; // font-size (px)
  lh: number; // line-height multiplier
  ls: string; // letter-spacing
  capsLs?: string; // letter-spacing for uppercase
  weight: 400 | 500 | 600 | 700;
  role: string;
}

export class LiminalLayoutEngine {
  // == 1. SPACING ==
  // Cohesive band (within-group): 4, 8, 12
  // Separating band (between-group): 16, 24, 32, 48, 64, 96
  // Liminal boundary: 12 = last "one unit", 16 = first "separate"
  static readonly SPACING = {
    1: 4,   // Atom (below this, elements read as "touching")
    2: 8,   // Cohesive tight
    3: 12,  // Cohesive loose (liminal boundary: last one-unit)
    4: 16,  // Separating close (first separate)
    5: 24,  // Separating medium
    6: 32,  // Separating comfortable
    7: 48,  // Separating section
    8: 64,  // Separating block
    9: 96,  // Separating page
  } as const;

  // == 2. RADIUS ==
  // Scale: 4, 6, 8, 10, 12, 16, 20, 24, full
  static readonly RADIUS = {
    4: 4,
    6: 6,
    chip: 6,        // chip / badge
    8: 8,
    10: 10,
    control: 10,    // input / button / select
    12: 12,
    16: 16,
    card: 16,       // card
    20: 20,
    panel: 20,      // panel / modal
    24: 24,
    container: 24,  // container / page-wrapper
    full: 9999,     // ONLY for badges / toggles (it is "loud")
  } as const;

  // Concentric Harmony Formula: r_inner = max(4, r_outer − padding)
  static getConcentricRadius(rOuter: number, padding: number): number {
    return Math.max(4, rOuter - padding);
  }

  // == 3. TYPOGRAPHY ==
  //
  // The ratio is the design; the base is the reading condition.
  //
  // The eight levels are a modular scale at 1.2. That ratio is what makes the
  // scale read as one family, so it is fixed. The base is not a design choice —
  // it is the size that is comfortable to read, and that depends on how far the
  // screen is from the eye. On a 320px phone held close, 14px is comfortable;
  // on a 1440px monitor, 16.5px is. So the base is fluid and every level is
  // derived from it. Nothing here is hand-picked.
  //
  // Weights: 400 body · 500 label/button · 600 heading · 700 display ONLY
  // (never 800/900).
  static readonly TYPE_RATIO = 1.2;

  /** Level 3 is the base; every other level is base × ratio^(n − 3). */
  static readonly TYPE_BASE_LEVEL = 3;

  /**
   * The fluid base, in `rem` so it honours the reader's browser font-size
   * setting (WCAG 2.2 · 1.4.4 Resize Text). A `px`-only clamp would ignore it.
   *
   * Resolves to 14px at a 320px viewport and 16.5px at 1440px — a ±8% band
   * around the 16px reference, which keeps the system's restraint intact.
   */
  static readonly TYPE_BASE_CSS = 'clamp(0.875rem, 0.2232vw + 0.8304rem, 1.03125rem)';

  /** The base the scale resolves to at the default 16px root. Reference only. */
  static readonly TYPE_BASE_REF = 16;

  /** Multiplier applied to the base for a given level. */
  static typeScale(level: number): number {
    return Math.pow(this.TYPE_RATIO, level - this.TYPE_BASE_LEVEL);
  }

  /**
   * `font-size` for a level, derived from the fluid base rather than written
   * down. Level 3 is the base itself, so it needs no multiplication.
   */
  static getTypeSizeCss(level: number): string {
    const k = this.typeScale(level);
    if (k === 1) return 'var(--liminal-type-base)';
    return `calc(var(--liminal-type-base) * ${k.toFixed(6)})`;
  }

  /** The scale at the reference base — for docs, previews and static renders. */
  static readonly TYPOGRAPHY: Record<number, TypeLevel> = (() => {
    const lh: Record<number, number> = { 1: 1.45, 2: 1.5, 3: 1.6, 4: 1.35, 5: 1.25, 6: 1.2, 7: 1.15, 8: 1.1 };
    const ls: Record<number, string> = {
      1: '+0.04em', 2: '+0.01em', 3: '0', 4: '-0.005em',
      5: '-0.01em', 6: '-0.015em', 7: '-0.02em', 8: '-0.025em',
    };
    const weight: Record<number, 400 | 500 | 600 | 700> = {
      1: 400, 2: 500, 3: 400, 4: 600, 5: 600, 6: 600, 7: 600, 8: 700,
    };
    const role: Record<number, string> = {
      1: 'meta, quaternary', 2: 'label, tertiary', 3: 'body, secondary',
      4: 'lead, h4', 5: 'h3', 6: 'h2', 7: 'h1', 8: 'display',
    };
    const out: Record<number, TypeLevel> = {};
    for (let n = 1; n <= 8; n++) {
      out[n] = {
        fs: Math.round(this.TYPE_BASE_REF * this.typeScale(n) * 100) / 100,
        lh: lh[n],
        ls: ls[n],
        ...(n === 1 ? { capsLs: '+0.08em' } : {}),
        weight: weight[n],
        role: role[n],
      };
    }
    return out;
  })();

  static getTypeStyle(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, isCaps: boolean = false): CSSProperties {
    const t = this.TYPOGRAPHY[level];
    return {
      // Derived from the fluid base so inline styles respond to the viewport too.
      fontSize: this.getTypeSizeCss(level),
      lineHeight: t.lh,
      letterSpacing: isCaps && t.capsLs ? t.capsLs : t.ls,
      fontWeight: t.weight,
    };
  }

  // == 4. BREAKPOINTS ==
  //
  // A breakpoint is not a device. It is the width at which a layout stops
  // fitting — so each one is derived from the content's own minimum widths,
  // and each can be checked: at the breakpoint the layout sits exactly on its
  // floor; one pixel narrower, something is squeezed below what it needs.
  //
  // The six numbers this replaces (600 / 640 / 699 / 768 / 800 / 1099) were
  // device categories wearing numeric costumes. Two of them disagreed about
  // the same event: the sidebar was hidden at 800px but the nav that replaces
  // it appeared at 640px — so between 640 and 800 there was neither.

  /**
   * The narrowest a text column may be and still read as a column.
   * 45 characters is the floor of a comfortable measure (Bringhurst: 45–75);
   * at the 16px body size an Inter character advances ~0.5em, so 45 × 8px.
   */
  static readonly MEASURE_MIN = 360;

  /** The narrowest a grid cell may be and still hold a control or a label. */
  static readonly CELL_MIN = 64;

  /** The narrowest a form field may be and still show a value (~20 chars). */
  static readonly FIELD_MIN = 200;

  /** Sidebar width. */
  static readonly SIDEBAR_W = 220;

  /**
   * Every breakpoint, derived. Nothing here is chosen.
   *
   * `gridWide` — twelve cells at their floor, plus the eleven gaps between.
   * `gridMid`  — six cells at their floor, plus the five gaps between.
   * `formRow`  — two fields side by side, plus the gap between.
   * `shellSidebar` — sidebar + gap + one readable column + body padding.
   *
   * The mobile nav appears at `shellSidebar`, not at its own number: it exists
   * *because* the sidebar is gone, so it is the same event and must be the
   * same width.
   */
  static readonly BREAKPOINTS = (() => {
    const s = LiminalLayoutEngine.SPACING;
    return {
      gridWide: 12 * LiminalLayoutEngine.CELL_MIN + 11 * s[4], // 944
      gridMid: 6 * LiminalLayoutEngine.CELL_MIN + 5 * s[4], // 464
      formRow: 2 * LiminalLayoutEngine.FIELD_MIN + s[5], // 424
      shellSidebar:
        LiminalLayoutEngine.SIDEBAR_W + s[5] + LiminalLayoutEngine.MEASURE_MIN + 2 * s[5], // 652
    } as const;
  })();
}
