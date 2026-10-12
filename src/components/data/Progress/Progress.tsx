import React, { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  semantic?: 'success' | 'warning' | 'danger' | 'info';
  color?: string;
  /** The progressbar's accessible name, when there is no visible label. */
  ariaLabel?: string;
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
  ariaLabel,
  className = '',
  style: customStyle = {},
}: ProgressProps) {
  const host = useHostSurface();
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

  // The progressbar's accessible name: the label element when there is one,
  // otherwise an explicit aria-label the caller passes.
  const labelId = `${useId()}-label`;

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
    background: resolveSurface({ role: 'control', on: host }).background,
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
      // A progressbar must have an accessible name. The label was rendered as a
      // sibling span, so a screen reader announced a percentage with no idea
      // what it measured — axe calls that serious.
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : ariaLabel}
    >
      {(showLabel || label) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
            lineHeight: 1.4,
          }}
        >
          <span id={labelId} style={{ color: getTextStyle('secondary', 1).color }}>
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
