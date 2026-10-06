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
    chip: 6,        // chip / badge
    8: 8,
    control: 10,    // input / button / select
    12: 12,
    card: 16,       // card
    panel: 20,      // panel / modal
    container: 24,  // container / page-wrapper
    full: 9999,     // ONLY for badges / toggles (it is "loud")
  } as const;

  // Concentric Harmony Formula: r_inner = max(4, r_outer − padding)
  static getConcentricRadius(rOuter: number, padding: number): number {
    return Math.max(4, rOuter - padding);
  }

  // == 3. TYPOGRAPHY ==
  // Modular 1.2 ratio, base 16
  // Weights: 400 body · 500 label/button · 600 heading · 700 display ONLY (never 800/900)
  static readonly TYPOGRAPHY: Record<number, TypeLevel> = {
    1: { fs: 11, lh: 1.45, ls: '+0.04em', capsLs: '+0.08em', weight: 400, role: 'meta, quaternary' },
    2: { fs: 13, lh: 1.50, ls: '+0.01em', weight: 500, role: 'label, tertiary' },
    3: { fs: 16, lh: 1.60, ls: '0',       weight: 400, role: 'body, secondary' },
    4: { fs: 19, lh: 1.35, ls: '-0.005em',weight: 600, role: 'lead, h4' },
    5: { fs: 23, lh: 1.25, ls: '-0.01em', weight: 600, role: 'h3' },
    6: { fs: 28, lh: 1.20, ls: '-0.015em',weight: 600, role: 'h2' },
    7: { fs: 33, lh: 1.15, ls: '-0.02em', weight: 600, role: 'h1' },
    8: { fs: 40, lh: 1.10, ls: '-0.025em',weight: 700, role: 'display' },
  };

  static getTypeStyle(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, isCaps: boolean = false): CSSProperties {
    const t = this.TYPOGRAPHY[level];
    return {
      fontSize: `${t.fs}px`,
      lineHeight: t.lh,
      letterSpacing: isCaps && t.capsLs ? t.capsLs : t.ls,
      fontWeight: t.weight,
    };
  }
}
