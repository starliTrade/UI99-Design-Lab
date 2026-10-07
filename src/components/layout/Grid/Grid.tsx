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

  return (
    <div className={`liminal-grid ${className}`} style={gridStyle}>
      {children}
      <style>{`
        .liminal-grid-col {
          grid-column: var(--col-desktop) !important;
        }
        @media (max-width: 1099px) {
          .liminal-grid-col {
            grid-column: var(--col-md) !important;
          }
        }
        @media (max-width: 699px) {
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
