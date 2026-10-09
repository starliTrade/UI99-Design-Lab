import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLiminalStyle, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface PanelProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  padding?: 'md' | 'lg' | number;
  parentRadius?: number;
  radius?: number;
  surfaceLevel?: number;
  className?: string;
  style?: CSSProperties;
}

export function Panel({
  children,
  title,
  actions,
  padding = 'md',
  parentRadius = LiminalLayoutEngine.RADIUS.container,
  radius,
  surfaceLevel = 2,
  className = '',
  style: customStyle = {},
}: PanelProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Panel: surfaceLevel = 2, isContainer = true, interactive = false, state = 'idle', NO shadow
  const limStyle = getLiminalStyle({
    surfaceLevel,
    isContainer: true,
    interactive: false,
    state: 'idle',
  });

  const paddingValues: Record<'md' | 'lg', number> = {
    md: SPACING[5], // 24px
    lg: SPACING[6], // 32px
  };

  const resolvedPadding = typeof padding === 'number' ? padding : (paddingValues[padding] ?? SPACING[5]);
  const computedRadius = radius ?? (parentRadius ? LiminalLayoutEngine.getConcentricRadius(parentRadius, resolvedPadding) : RADIUS.panel);

  const panelStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for flat panels
    borderRadius: `${computedRadius}px`,
    padding: `${resolvedPadding}px`,
    color: getTextStyle('secondary', 2).color,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[5]}px`, // 24px gap between header and sections
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[5].fs}px`, // 23px
    lineHeight: TYPOGRAPHY[5].lh,
    letterSpacing: TYPOGRAPHY[5].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 2).color,
    margin: 0,
  };

  const hasHeader = Boolean(title || actions);

  return (
    <div className={className} style={panelStyle}>
      {hasHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${SPACING[3]}px`, // 12px
            boxSizing: 'border-box',
          }}
        >
          {title ? <h2 style={titleStyle}>{title}</h2> : <div />}
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: `${SPACING[2]}px` }}>{actions}</div>}
        </div>
      )}
      <div style={{ flex: 1, color: getTextStyle('secondary', 2).color }}>
        {children}
      </div>
    </div>
  );
}

export default Panel;
