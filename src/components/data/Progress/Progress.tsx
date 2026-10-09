import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  semantic?: 'success' | 'warning' | 'danger' | 'info';
  color?: string;
  showLabel?: boolean;
  showValue?: boolean;
  height?: number;
  label?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  semantic,
  color: customColor,
  showLabel = false,
  showValue,
  height,
  label,
  className = '',
  style: customStyle = {},
}: ProgressProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  const heights: Record<'sm' | 'md' | 'lg', number> = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const trackHeight = height ?? heights[size];
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Fill color resolution
  let fillColor = BRAND.hex; // default brand #E9ECF2
  if (customColor) {
    fillColor = customColor;
  } else if (semantic) {
    const key = semantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
    fillColor = SEMANTICS[key]?.solid ?? BRAND.hex;
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[2]}px`, // 8px
    width: '100%',
    boxSizing: 'border-box',
    ...customStyle,
  };

  const trackStyle: CSSProperties = {
    width: '100%',
    height: `${trackHeight}px`,
    borderRadius: `${trackHeight / 2}px`,
    background: getLadderColor(3), // Surface 3 #0D0E12
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  };

  const fillStyle: CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    borderRadius: 'inherit',
    background: fillColor,
    transition: LiminalMotionEngine.getTransition('width', 'slower', 'spring'),
  };

  return (
    <div
      className={className}
      style={containerStyle}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {(showLabel || label) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            lineHeight: 1.4,
          }}
        >
          <span style={{ color: getTextStyle('secondary', 1).color }}>
            {label}
          </span>
          <span
            style={{
              color: getTextStyle('primary', 1).color,
              direction: 'ltr',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
            }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}

export default Progress;
