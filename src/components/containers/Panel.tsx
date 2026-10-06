import React from 'react';
import { getLiminalStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export interface PanelProps {
  children: React.ReactNode;
  parentRadius?: number;
  padding?: number;
  radius?: number;
  surfaceLevel?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Panel({
  children,
  parentRadius = LiminalLayoutEngine.RADIUS.container,
  padding = 16,
  radius,
  surfaceLevel = 2,
  className = '',
  style: userStyle,
}: PanelProps) {
  // Concentric rule: r_inner = max(4, r_outer - padding)
  const computedRadius =
    radius ?? LiminalLayoutEngine.getConcentricRadius(parentRadius, padding);

  const panelStyle = getLiminalStyle({
    surfaceLevel,
    isContainer: true,
  });

  return (
    <div
      className={`font-mono transition-all ${className}`}
      style={{
        ...panelStyle.style,
        borderRadius: `${computedRadius}px`,
        padding: `${padding}px`,
        ...userStyle,
      }}
    >
      {children}
    </div>
  );
}
