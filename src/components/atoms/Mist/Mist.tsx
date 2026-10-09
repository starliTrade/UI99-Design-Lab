import React, { useState } from 'react';
import type { CSSProperties, ReactNode, MouseEvent, FocusEvent } from 'react';
import { LiminalColorEngine, MistTier } from '../../../engine/liminal-color-engine';
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
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const defaultRadius = tier === 'hero' ? 9999 : RADIUS.card;
  const finalRadius = radius !== undefined ? radius : defaultRadius;

  const mist = LiminalColorEngine.getMistStyle(light, tier);
  const { r, g, b } = LiminalColorEngine.hexToRgb(light);
  const H = `${r}, ${g}, ${b}`;

  // Interactive dynamic effects for hero tier
  let activeBoxShadow = mist.boxShadow;
  let activeFilter = 'none';

  if (tier === 'hero' && !disabled) {
    if (isActive) {
      activeFilter = 'brightness(0.92)';
    } else if (isHovered) {
      activeFilter = 'brightness(1.08)';
    }
  }

  const baseStyle: CSSProperties = {
    position: 'relative',
    overflow: 'visible',
    borderRadius: `${finalRadius}px`,
    background: mist.background,
    boxShadow: activeBoxShadow,
    filter: activeFilter,
    color: 'rgba(255, 255, 255, 0.90)',
    fontSize: `${TYPOGRAPHY[3].fs}px`,
    lineHeight: TYPOGRAPHY[3].lh,
    fontWeight: tier === 'hero' ? 600 : 500,
    ...getFocusRing(isFocused),
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
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onFocus={(e: FocusEvent<HTMLElement>) => {
        if (!disabled && (e.target as HTMLElement).matches(':focus-visible')) {
          setIsFocused(true);
        }
      }}
      onBlur={() => setIsFocused(false)}
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
