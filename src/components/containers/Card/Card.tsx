import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle, SURFACE_TINT } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveSurface, ROLE_LEVEL, type SurfaceRole } from '../../../engine/liminal-surface';
import { SurfaceProvider, useHostSurface } from '../../../engine/liminal-surface-context';
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
  /**
   * What this card IS in the hierarchy, not which ladder step it wants.
   *
   * It used to be `surfaceLevel?: 1 | 2 | 3 | 4` — a raw depth, and a raw depth
   * cannot be checked: at level 3 the old resolver still drew a rim of 1, which
   * the contract says belongs to chrome and work, not to a surface three steps
   * up. `chrome` is the level the card has always sat at.
   */
  surface?: Extract<SurfaceRole, 'chrome' | 'work' | 'panel'>;
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
const dividerRim = resolveBorder({ role: 'panel', kind: 'separator' });

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

  // A well is CUT INTO its host — one and a half steps below the card's own
  // role, with a defined edge and a concave rim. The engine states the rule;
  // this used to be a hand-picked `(1, 2, true)`. The host comes from context,
  // because an InsetWell does not know which card it was cut into.
  const host = useHostSurface();
  const concaveRim = resolveSurface({ role: host, inset: true }).rimColors;

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
  surface = 'chrome',
  radius,
  className = '',
  style: customStyle = {},
}: CardProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // A structural surface: it does not answer the pointer. It floats only when
  // it is given an elevation, or when it is featured — and an explicit
  // elevation wins over `isFeatured`, which is the order the old resolver used.
  const limStyle = resolveSurface({
    role: surface,
    interactive: false,
    elevation: elevation ?? (isFeatured ? 2 : undefined),
  });
  // The text sits on the card's own level.
  const textLevel = ROLE_LEVEL[surface];

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
    color: getTextStyle('secondary', textLevel).color,
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
    color: getTextStyle('primary', textLevel).color,
    margin: 0,
  };

  return (
    <SurfaceProvider role={surface}>
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
                  ...getTextStyle('tertiary', textLevel),
                  fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
                  marginTop: `${SPACING[0]}px`,
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
          color: getTextStyle('secondary', textLevel).color,
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
    </SurfaceProvider>
  );
}

Card.Well = InsetWell;

export default Card;
