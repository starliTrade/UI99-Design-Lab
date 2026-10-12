import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface GridProps {
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface GridColProps {
  col: number;
  md?: number;
  sm?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function GridCol({
  col,
  md,
  sm,
  children,
  className = '',
  style: customStyle = {},
}: GridColProps) {
  const desktopSpan = Math.min(12, Math.max(1, col));
  const tabletSpan = Math.min(12, Math.max(1, md ?? (desktopSpan > 6 ? 12 : 6)));
  const mobileSpan = Math.min(12, Math.max(1, sm ?? 12));

  const colStyle: CSSProperties = {
    gridColumn: `span ${desktopSpan} / span ${desktopSpan}`,
    minWidth: 0,
    boxSizing: 'border-box',
    // Custom CSS variables for responsive media queries
    ['--col-desktop' as any]: `span ${desktopSpan}`,
    ['--col-md' as any]: `span ${tabletSpan}`,
    ['--col-sm' as any]: `span ${mobileSpan}`,
    ...customStyle,
  };

  return (
    <div className={`liminal-grid-col ${className}`} style={colStyle}>
      {children}
    </div>
  );
}

export function Grid({
  gap = 'md',
  children,
  className = '',
  style: customStyle = {},
}: GridProps) {
  const SPACING = LiminalLayoutEngine.SPACING;

  const gapMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: SPACING[3], // 12px
    md: SPACING[4], // 16px
    lg: SPACING[5], // 24px
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gap: `${gapMap[gap]}px`,
    width: '100%',
    boxSizing: 'border-box',
    ...customStyle,
  };

  const BP = LiminalLayoutEngine.BREAKPOINTS;

  return (
    <div className={`liminal-grid ${className}`} style={gridStyle}>
      {children}
      <style>{`
        /* The grid answers to its own width, not the viewport's. A grid placed
           in a 220px sidebar must collapse its spans even on a 1440px screen —
           a media query cannot see that, a container query can. */
        .liminal-grid {
          container-type: inline-size;
          container-name: liminal-grid;
        }
        .liminal-grid-col {
          grid-column: var(--col-desktop) !important;
        }
        /* Strictly below gridWide — NOT a max-width. The breakpoint is the
           width at which twelve cells still fit, so twelve columns must survive
           AT that width and collapse one pixel below it. A max-width query
           would collapse at the floor itself: off by one, and the derivation
           would no longer describe what the code does. */
        @container liminal-grid (width < ${BP.gridWide}px) {
          .liminal-grid-col {
            grid-column: var(--col-md) !important;
          }
        }
        @container liminal-grid (width < ${BP.gridMid}px) {
          .liminal-grid-col {
            grid-column: var(--col-sm) !important;
          }
        }
      `}</style>
    </div>
  );
}

Grid.Col = GridCol;

export default Grid;
