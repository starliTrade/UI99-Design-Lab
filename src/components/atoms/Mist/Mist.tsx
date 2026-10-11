import React, { useState } from 'react';
import type { CSSProperties, ReactNode, MouseEvent, FocusEvent } from 'react';
import { LiminalColorEngine, MistTier } from '../../../engine/liminal-color-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { getFocusRing } from '../../../engine/spec-engine';

export interface MistProps {
  as?: 'button' | 'div';
  tier?: MistTier;
  light?: string; // hex color
  radius?: number;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Mist({
  as = 'button',
  tier = 'quiet',
  light = LiminalColorEngine.BRAND_PRIMARY.hex,
  radius,
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  'aria-label': ariaLabel,
}: MistProps) {

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const defaultRadius = tier === 'hero' ? 9999 : RADIUS.card;
  const finalRadius = radius !== undefined ? radius : defaultRadius;

  const mist = LiminalColorEngine.getMistStyle(light, tier);
  const { r, g, b } = LiminalColorEngine.hexToRgb(light);
  const H = `${r}, ${g}, ${b}`;

  // The hover/press response is a BRIGHTNESS change, not a colour change: the
  // surface keeps its material and catches more light. The browser applies it now.
  const activeBoxShadow = mist.boxShadow;

  const baseStyle: CSSProperties = {
    position: 'relative',
    overflow: 'visible',
    borderRadius: `${finalRadius}px`,
    background: mist.background,
    boxShadow: activeBoxShadow,
    color: getTextStyle('primary', 2).color,
    fontSize: `${TYPOGRAPHY[3].fs}px`,
    lineHeight: TYPOGRAPHY[3].lh,
    fontWeight: tier === 'hero' ? 600 : 500,
    cursor: disabled ? 'not-allowed' : as === 'button' || onClick ? 'pointer' : 'default',
    opacity: disabled ? 0.45 : 1,
    transition: `${LiminalMotionEngine.getTransition('filter', 'normal')}, ${LiminalMotionEngine.getTransition('box-shadow', 'normal')}, ${LiminalMotionEngine.getTransition('transform', 'fast')}, ${LiminalMotionEngine.getTransition('outline', 'fast')}`,
    border: 'none',
    boxSizing: 'border-box',
    display: as === 'button' ? 'inline-flex' : undefined,
    alignItems: as === 'button' ? 'center' : undefined,
    justifyContent: as === 'button' ? 'center' : undefined,
    gap: as === 'button' ? `${SPACING[2]}px` : undefined,
    padding: as === 'button' ? (tier === 'hero' ? `${SPACING[3]}px ${SPACING[5]}px` : `${SPACING[2]}px ${SPACING[4]}px`) : undefined,
    userSelect: as === 'button' ? 'none' : undefined,
    textDecoration: 'none',
    ...style,
  };

  const Component = as === 'button' ? 'button' : 'div';

  return (
    <Component
      type={as === 'button' ? type : undefined}
      disabled={as === 'button' ? disabled : undefined}
      onClick={disabled ? undefined : onClick}
      data-liminal-mist=""
      data-liminal-focusable=""
      data-liminal-disabled={disabled ? "" : undefined}
      className={className}
      style={baseStyle}
      aria-label={ariaLabel}
    >
      {/* ─── RING LAYER (separate blurred 1px border element) ─── */}
      <span aria-hidden="true" style={mist.ringLayer} />
      {children}
    </Component>
  );
}

export default Mist;
