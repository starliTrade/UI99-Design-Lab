import React from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export interface LiminalIconProps {
  /**
   * Phosphor icon component (e.g., House, MagnifyingGlass, Gear)
   */
  icon: PhosphorIcon;
  
  /**
   * Size token
   * @default 'md' (20px)
   */
  size?: IconSize;
  
  /**
   * Weight variant
   * @default 'light' (1.5px stroke)
   */
  weight?: IconWeight;
  
  /**
   * Color (defaults to currentColor for inheritance)
   */
  color?: string;
  
  /**
   * Accessibility label (if decorative, leave empty)
   */
  'aria-label'?: string;
  
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Icon size tokens (pixels)
 */
export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * LiminalIcon · Canonical Icon Component
 * Wraps Phosphor Icons with Liminal size/weight tokens
 */
export function LiminalIcon({
  icon: IconComponent,
  size = 'md',
  weight = 'light',
  color,
  'aria-label': ariaLabel,
  className = '',
  style = {},
}: LiminalIconProps) {
  const px = ICON_SIZES[size];
  
  return React.createElement(IconComponent, {
    size: px,
    weight,
    color: color || 'currentColor',
    'aria-label': ariaLabel,
    'aria-hidden': ariaLabel ? undefined : true,
    className,
    style,
  });
}

export default LiminalIcon;
