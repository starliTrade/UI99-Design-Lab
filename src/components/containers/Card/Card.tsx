import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLiminalStyle, getDirectionalRim, getLadderColor, getTextStyle, SURFACE_TINT } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveSurface } from '../../../engine/liminal-surface';
import { resolveBorder } from '../../../engine/liminal-surface';
import { Divider } from '../Divider';

export interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | string;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  elevation?: 1 | 2 | 3 | 4;
  isFeatured?: boolean;
  surfaceLevel?: 1 | 2 | 3 | 4;
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

export interface InsetWellProps {
  children: ReactNode;
  padding?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

/**
 * Inset Well: Sub-element recessed into Card surface
 * Governed by Concentric Harmony: r_inner = max(4, r_outer - padding)
 * Uses Inverted Directional Rim (Concave: top darker shadow, bottom specular reflection)
 */
/** A divider inside a card is a hairline on the panel role. */
const dividerRim = resolveBorder({ role: 'panel', kind: 'hairline' });

export function InsetWell({
  children,
  padding = 'sm',
  className = '',
  style: customStyle = {},
}: InsetWellProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;

  // Concentric radius calculation: r_inner = max(4, r_outer - padding)
  const paddingVal = padding === 'sm' ? SPACING[3] : SPACING[4]; // 12px or 16px
  const innerRadius = LiminalLayoutEngine.getConcentricRadius(RADIUS.card, paddingVal);

  // Inverted Concave Rim (S1 concave)
  const concaveRim = getDirectionalRim(1, 2, true);

  const wellStyle: CSSProperties = {
    background: concaveRim ? concaveRim.cssBackground : resolveSurface({ role: 'work', state: 'active' }).background,
    border: concaveRim ? '1px solid transparent' : 'none',
    borderRadius: `${innerRadius}px`,
    padding: `${paddingVal}px`,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[2]}px`,
    ...customStyle,
  };

  return (
    <div className={className} style={wellStyle}>
      {children}
    </div>
  );
}

export function Card({
  children,
  padding = 'md',
  title,
  subtitle,
  action,
  footer,
  elevation,
  isFeatured = false,
  surfaceLevel = 1,
  radius,
  className = '',
  style: customStyle = {},
}: CardProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const limStyle = getLiminalStyle({
    surfaceLevel,
    isContainer: true,
    interactive: false,
    isFeatured,
    isFloating: Boolean(elevation),
    elevation,
    state: 'idle',
  });

  const paddingValues: Record<string, number> = {
    sm: SPACING[4], // 16px
    md: SPACING[5], // 24px
    lg: SPACING[6], // 32px
  };

  const pad = typeof padding === 'string' && paddingValues[padding] !== undefined 
    ? `${paddingValues[padding]}px` 
    : (typeof padding === 'number' ? `${padding}px` : (padding || `${SPACING[5]}px`));

  const finalRadius = radius !== undefined ? radius : RADIUS.card;

  const cardStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: elevation ? limStyle.style.boxShadow : 'none',
    borderRadius: `${finalRadius}px`,
    padding: (title || subtitle || action || footer) ? 0 : pad,
    color: getTextStyle('secondary', surfaceLevel).color,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...customStyle,
  };

  const headerTitleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(4), // 19px
    lineHeight: TYPOGRAPHY[4].lh,
    letterSpacing: TYPOGRAPHY[4].ls,
    fontWeight: 600,
    color: getTextStyle('primary', surfaceLevel).color,
    margin: 0,
  };

  return (
    <div className={className} style={cardStyle}>
      {(title || subtitle || action) && (
        <div
          style={{
            padding: `${SPACING[4]}px ${SPACING[5]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${dividerRim}`,
          }}
        >
          <div>
            {title && (
              typeof title === 'string' ? (
                <h3 style={headerTitleStyle}>{title}</h3>
              ) : (
                title
              )
            )}
            {subtitle && (
              <div
                style={{
                  ...getTextStyle('tertiary', surfaceLevel),
                  fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
                  marginTop: '2px',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: (title || subtitle || action || footer) ? pad : undefined,
          color: getTextStyle('secondary', surfaceLevel).color,
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          style={{
            padding: `${SPACING[3]}px ${SPACING[5]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
            borderTop: `1px solid ${dividerRim}`,
            backgroundColor: SURFACE_TINT.faint,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

Card.Well = InsetWell;

export default Card;
