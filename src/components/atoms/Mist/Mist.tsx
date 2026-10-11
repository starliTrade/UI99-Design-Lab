import React from 'react';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';
import { mistCssVars } from '../../../engine/liminal-mist';
import type { SurfaceRole } from '../../../engine/liminal-surface';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface MistProps {
  as?: 'button' | 'div';
  /**
   * Which floating surface this is. The mist derives its blur, halo, shadow and
   * fill from this role's ladder level — a toast floats higher than a menu, so
   * it diffuses more and casts a larger shadow.
   */
  role?: Extract<SurfaceRole, 'menu' | 'popover' | 'modal' | 'toast'>;
  /** 'hero' is the single allowed emphasised mist in an app; 'quiet' is the rest. */
  tier?: 'hero' | 'quiet';
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
  role = 'popover',
  tier = 'quiet',
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

  // Every mist value comes from the role's height. Nothing is hand-tuned here.
  const mistVars = mistCssVars(role);

  const baseStyle: CSSProperties = {
    ...mistVars,
    display: as === 'button' ? 'inline-flex' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${SPACING[2]}px`,
    padding: tier === 'hero' ? `${SPACING[3]}px ${SPACING[5]}px` : `${SPACING[2]}px ${SPACING[4]}px`,
    borderRadius: `${finalRadius}px`,
    color: getTextStyle('primary', 2).color,
    fontSize: `${TYPOGRAPHY[3].fs}px`,
    lineHeight: TYPOGRAPHY[3].lh,
    fontWeight: tier === 'hero' ? 600 : 500,
    cursor: disabled ? 'not-allowed' : as === 'button' || onClick ? 'pointer' : 'default',
    opacity: disabled ? 0.45 : 1,
    border: 'none',
    boxSizing: 'border-box',
    ...style,
  } as CSSProperties;

  const props = {
    'data-liminal-mist': '',
    'data-liminal-focusable': '',
    'data-liminal-disabled': disabled ? '' : undefined,
    className,
    style: baseStyle,
    onClick: disabled ? undefined : onClick,
    'aria-label': ariaLabel,
  };

  if (as === 'button') {
    return (
      <button type={type} disabled={disabled} {...(props as any)}>
        {children}
      </button>
    );
  }

  return <div {...(props as any)}>{children}</div>;
}
