import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveSurface, ROLE_LEVEL, type SurfaceRole } from '../../../engine/liminal-surface';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface PanelProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  padding?: 'md' | 'lg' | number;
  parentRadius?: number;
  radius?: number;
  /**
   * What this panel IS in the hierarchy, not which ladder step it wants.
   *
   * It used to be `surfaceLevel?: number` — a raw depth. A component that names
   * a number cannot be checked against the contract, and two components at the
   * same depth could disagree. `work` is the level the panel has always sat at.
   */
  surface?: Extract<SurfaceRole, 'work' | 'panel'>;
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
  surface = 'work',
  className = '',
  style: customStyle = {},
}: PanelProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // A structural surface: it does not answer the pointer, and it never floats.
  const limStyle = resolveSurface({ role: surface, interactive: false });
  // The text sits on the panel's own level. It used to be pinned to level 2, so
  // a caller who moved the surface moved the panel but not its text.
  const textLevel = ROLE_LEVEL[surface];

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
    color: getTextStyle('secondary', textLevel).color,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[5]}px`, // 24px gap between header and sections
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(5), // 23px
    lineHeight: TYPOGRAPHY[5].lh,
    letterSpacing: TYPOGRAPHY[5].ls,
    fontWeight: 600,
    color: getTextStyle('primary', textLevel).color,
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
