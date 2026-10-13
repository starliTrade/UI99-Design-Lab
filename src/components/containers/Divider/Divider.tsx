import React from 'react';
import type { CSSProperties } from 'react';
import { getLadderColor } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveBorder } from '../../../engine/liminal-surface';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  style: customStyle = {},
}: DividerProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const BORDER = LiminalLayoutEngine.BORDER;

  // Exact half-step S1.5 (#090A0D = canonical rimSide) for optical continuity
  // A divider is a seam inside the work surface, not a decorative line.
  const dividerColor = resolveBorder({ role: 'work', kind: 'hairline' });

  const spacingValues: Record<'sm' | 'md' | 'lg', number> = {
    sm: SPACING[2], // 8px
    md: SPACING[4], // 16px
    lg: SPACING[5], // 24px
  };

  const margin = spacingValues[spacing];

  const dividerStyle: CSSProperties =
    orientation === 'horizontal'
      ? {
          height: `${BORDER.hairline}px`,
          width: '100%',
          background: dividerColor,
          margin: `${margin}px 0`,
          border: 'none',
          flexShrink: 0,
          ...customStyle,
        }
      : {
          width: `${BORDER.hairline}px`,
          height: '100%',
          minHeight: `${LiminalLayoutEngine.SPACING[4]}px`,
          background: dividerColor,
          margin: `0 ${margin}px`,
          border: 'none',
          flexShrink: 0,
          alignSelf: 'stretch',
          ...customStyle,
        };

  return <div role="separator" aria-orientation={orientation} className={className} style={dividerStyle} />;
}

export default Divider;
