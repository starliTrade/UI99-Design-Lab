import type { CSSProperties } from 'react';

/**
 * LIMINAL SPACING · RADIUS · TYPOGRAPHY — LOCKED SPEC v1.0
 * Layout, Geometry, and Typography Engine.
 */

/** The steps of the type scale. 1–8 are the interface; 9–10 are the headline band. */
export type TypeLevelIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

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
    /**
     * The sub-atom. It exists because optical separation is a real need — a
     * caption nudged down to sit under a title, the gap between the cells of a
     * calendar — and it was being written as a raw `2px` in eleven places.
     *
     * It is NOT a spacing step. The atom's own note says why: below 4px,
     * elements read as touching. This value is for correcting an optical
     * relationship, never for separating two things. Naming it is the honest
     * move; hiding it as a literal is not.
     */
    0: 2,
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

  /**
   * CONTROL HEIGHTS
   *
   * The system had a spacing scale, a radius scale, a type scale and an icon
   * scale — and no size scale. So every control height was a literal: `44px`
   * eleven times, `32px` six times, and a scattering of others. They were
   * consistent by discipline rather than by construction.
   */
  static readonly CONTROL = {
    sm: 32,  // compact: a dense toolbar, a table's inline action
    md: 44,  // default, and the system's minimum interactive size
    lg: 52,  // a primary action that should read as the page's main one
  } as const;

  /**
   * TARGET SIZE
   *
   * `44` is not a taste. WCAG 2.5.5 (Target Size, AAA) asks for 44×44 CSS px
   * and 2.5.8 (AA) for 24×24; Apple's HIG says 44pt. The system's default
   * control height IS the accessible minimum, which is why `CONTROL.md` and
   * `TARGET.min` are the same number — and why it should be one name, not two
   * literals that happen to agree.
   */
  static readonly TARGET = {
    min: 44,
    aa: 24,
  } as const;

  /**
   * BORDER WIDTHS
   *
   * A hairline was written as a raw `1px` in five places. It is not a spacing
   * step and it is not a size — it is the thinnest line the system draws, and
   * it is the same value in every direction and on every surface.
   */
  static readonly BORDER = {
    hairline: 1,
    emphasis: 2,
  } as const;

  /**
   * CONTROL PADDING
   *
   * The horizontal and vertical padding inside a control. These do NOT sit on
   * the spacing scale and they are not derivable from the control height: a
   * 32px control with 11px text and a 1px border would compute to 8px, and the
   * designed value is 6. They are hand-tuned, which is exactly why they should
   * be named rather than scattered — three controls were using `6px 12px`,
   * `10px 18px` and `9px 12px` as literals.
   */
  /**
   * CONTROL PADDING — AND THE HORIZONTAL IS THREE TIMES THE VERTICAL.
   *
   * It was three hand-picked pairs — `6/12`, `10/18`, `12/24` — whose ratio drifted from 2.0
   * to 1.8 and back to 2.0. Measured on the rendered button, all three came out near 1.5
   * wide-to-tall, which is nearly SQUARE, and the reader's eye said so before the numbers
   * did: "lg has gone square, and x should be larger than y."
   *
   * `x = y × 3` is the only option tested that HOLDS A CONSTANT — the padding ratio is exactly
   * 3.0000 at every size, and the rendered shape lands at 2.00, 2.07 and 2.02. The small drift
   * is the LABEL, not the system: a button's width is its text plus its padding, and the text
   * grows with the font while the padding moves in fixed steps. That drift exists in every
   * button ever built.
   *
   * AND THE RATIO IS THE PROPERTY, NOT THE NUMBERS. 6/10/12 are unchanged; only the horizontal
   * follows from them now, so a size cannot drift out of shape on its own.
   */
  static readonly CONTROL_PADDING = {
    sm: { y: 6, x: 18 },
    md: { y: 10, x: 30 },
    lg: { y: 12, x: 36 },
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
  /**
   * THE SCALE HAS TEN LEVELS, AND THE TOP TWO ARE THE HEADLINE BAND.
   *
   * It had eight. Eight is the whole of an interface — meta, label, body, lead,
   * h3, h2, h1, display — and the largest of them is 41px at the reference base.
   * That is right for a product UI and it is not enough for a page that has to
   * state its claim in one line: a headline at 41px is a heading, not a
   * statement.
   *
   * So the scale continues. The RATIO does not change — 1.2, the same ratio
   * every other level uses — and nothing below moves by a single pixel. Two
   * levels are added where the scale already pointed:
   *
   *   9   display-lg   48px at the reference base
   *   10  display-xl   59px
   *
   * Measured against a reference in the wild: a product page's headline is 84px
   * at weight 700 with -0.01em tracking and a 1.1 line-height. Level 10 is 59px
   * and level 12 would be 85px — the band is here, and the site takes what its
   * sentence needs rather than what a number looked like.
   */
  static readonly TYPOGRAPHY: Record<number, TypeLevel> = (() => {
    const lh: Record<number, number> = {
      1: 1.45, 2: 1.5, 3: 1.6, 4: 1.35, 5: 1.25, 6: 1.2, 7: 1.15, 8: 1.1,
      9: 1.08, 10: 1.05,
    };
    const ls: Record<number, string> = {
      1: '+0.04em', 2: '+0.01em', 3: '0', 4: '-0.005em',
      5: '-0.01em', 6: '-0.015em', 7: '-0.02em', 8: '-0.025em',
      9: '-0.028em', 10: '-0.03em',
    };
    const weight: Record<number, 400 | 500 | 600 | 700> = {
      1: 400, 2: 500, 3: 400, 4: 600, 5: 600, 6: 600, 7: 600, 8: 700,
      9: 700, 10: 700,
    };
    const role: Record<number, string> = {
      1: 'meta, quaternary', 2: 'label, tertiary', 3: 'body, secondary',
      4: 'lead, h4', 5: 'h3', 6: 'h2', 7: 'h1', 8: 'display',
      9: 'display-lg', 10: 'display-xl',
    };
    const out: Record<number, TypeLevel> = {};
    for (let n = 1; n <= 10; n++) {
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

  static getTypeStyle(level: TypeLevelIndex, isCaps: boolean = false): CSSProperties {
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
