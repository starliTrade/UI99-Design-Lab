import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLiminalStyle, getDirectionalRim, getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { Divider } from '../Divider';

export interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  title?: string;
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
    background: concaveRim ? concaveRim.cssBackground : getLadderColor(0.5),
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
  className = '',
  style: customStyle = {},
}: CardProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Card: surfaceLevel = 1, isContainer = true, interactive = false, state = 'idle', Rim 1, NO shadow
  const limStyle = getLiminalStyle({
    surfaceLevel: 1,
    isContainer: true,
    interactive: false,
    state: 'idle',
  });

  const paddingValues: Record<'sm' | 'md' | 'lg', number> = {
    sm: SPACING[4], // 16px
    md: SPACING[5], // 24px
    lg: SPACING[6], // 32px
  };

  const cardStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for flat cards
    borderRadius: `${RADIUS.card}px`, // 16px
    padding: `${paddingValues[padding]}px`,
    color: getTextStyle('secondary', 1).color,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[4].fs}px`, // 19px
    lineHeight: TYPOGRAPHY[4].lh,
    letterSpacing: TYPOGRAPHY[4].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
  };

  return (
    <div className={className} style={cardStyle}>
      {title && (
        <>
          <h3 style={titleStyle}>{title}</h3>
          <Divider spacing="sm" />
        </>
      )}
      <div style={{ flex: 1, color: getTextStyle('secondary', 1).color }}>
        {children}
      </div>
    </div>
  );
}

Card.Well = InsetWell;

export default Card;
