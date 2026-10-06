import React from 'react';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export interface TagProps {
  hue?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Tag({ hue = 230, children, className = '', style: userStyle }: TagProps) {
  const ext = LiminalColorEngine.EXTENDED_SPECTRUM.find((x) => x.hue === hue);
  const color = ext?.hex ?? '#8CC3F2';

  return (
    <span
      className={`inline-flex items-center font-mono leading-none ${className}`}
      style={{
        display: 'inline-flex',
        padding: '4px 10px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.chip}px`, // 6px Chip
        fontSize: '11px',
        letterSpacing: '0.04em',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        color,
        ...userStyle,
      }}
    >
      {children}
    </span>
  );
}
