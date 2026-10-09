import React, { useState } from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import {
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  getFocusRing,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface NavItemProps {
  children: ReactNode;
  icon?: PhosphorIcon | ReactNode;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function NavItem({
  children,
  icon,
  active = false,
  onClick,
  href,
  disabled = false,
  className = '',
  style: customStyle = {},
}: NavItemProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Active state: Surface 2 with Rim 1 (180° directional rim)
  const activeRim = getDirectionalRim(2, 1, false);

  let bg = 'transparent';
  let color = getTextStyle('tertiary', 2).color;

  if (active) {
    bg = activeRim ? activeRim.cssBackground : getLadderColor(2);
    color = getTextStyle('primary', 2).color;
  } else if (isHovered && !disabled) {
    bg = getLadderColor(2); // S2
    color = getTextStyle('secondary', 2).color;
  }

  const navItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    padding: '9px 12px',
    borderRadius: `${RADIUS[8]}px`, // 8px
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontFamily: 'inherit',
    fontWeight: active ? 500 : 400,
    textDecoration: 'none',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    background: bg,
    color,
    boxShadow: 'none', // Strictly no shadow for nav items
    opacity: disabled ? 0.35 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: LiminalMotionEngine.TRANSITION.hover,
    ...getFocusRing(isKeyboardFocused),
    userSelect: 'none',
    width: '100%',
    textAlign: 'left',
    ...customStyle,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'function') {
      return <LiminalIcon icon={icon as PhosphorIcon} size="sm" weight="light" />;
    }
    return icon;
  };

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={className}
        style={navItemStyle}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsKeyboardFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onBlur={() => setIsKeyboardFocused(false)}
        aria-current={active ? 'page' : undefined}
      >
        {renderIcon()}
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      style={navItemStyle}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsKeyboardFocused(false)}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onBlur={() => setIsKeyboardFocused(false)}
      aria-current={active ? 'page' : undefined}
    >
      {renderIcon()}
      {children}
    </button>
  );
}

export default NavItem;
