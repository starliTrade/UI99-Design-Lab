import React from 'react';
import type { CSSProperties } from 'react';
import { getLadderColor } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

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

  // Exact half-step S1.5 (#090A0D = canonical rimSide) for optical continuity
  const dividerColor = getLadderColor(1.5);

  const spacingValues: Record<'sm' | 'md' | 'lg', number> = {
    sm: SPACING[2], // 8px
    md: SPACING[4], // 16px
    lg: SPACING[5], // 24px
  };

  const margin = spacingValues[spacing];

  const dividerStyle: CSSProperties =
    orientation === 'horizontal'
      ? {
          height: '1px',
          width: '100%',
          background: dividerColor,
          margin: `${margin}px 0`,
          border: 'none',
          flexShrink: 0,
          ...customStyle,
        }
      : {
          width: '1px',
          height: '100%',
          minHeight: '16px',
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
