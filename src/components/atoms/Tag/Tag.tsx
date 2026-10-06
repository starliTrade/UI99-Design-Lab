import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface TagProps {
  hue?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Tag({
  hue = 230,
  children,
  className = '',
  style: customStyle = {},
}: TagProps) {
  // Find matching hue in EXTENDED_SPECTRUM (fallback to Sapphire 230)
  const ext =
    LiminalColorEngine.EXTENDED_SPECTRUM.find((item) => item.hue === hue) ??
    LiminalColorEngine.EXTENDED_SPECTRUM[7]; // 230 Sapphire

  const tagStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: ext.hex,
    borderRadius: `${LiminalLayoutEngine.RADIUS.chip}px`, // 6px
    fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[1].fs}px`, // 11px
    letterSpacing: LiminalLayoutEngine.TYPOGRAPHY[1].ls, // +0.04em
    fontWeight: LiminalLayoutEngine.TYPOGRAPHY[2].weight, // 500
    padding: '4px 10px',
    lineHeight: 1.45,
    userSelect: 'none',
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <span className={className} style={tagStyle}>
      {children}
    </span>
  );
}

export default Tag;
