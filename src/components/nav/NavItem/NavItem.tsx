import React, { useState } from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import {
  getTextStyle,
  getFocusRing,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { resolveSurface, resolveInteractionVars } from '../../../engine/liminal-surface';

/** The nav item's vertical padding: off the spacing scale, so it is named. */
const NAV_ITEM_PAD_Y = 9;

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

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Active state: Surface 2 with Rim 1 (180° directional rim)
  const activeRim = resolveSurface({ role: 'work' }).rimColors;

  let bg = 'transparent';
  let color = getTextStyle('tertiary', 2).color;

  if (active) {
    bg = activeRim ? activeRim.cssBackground : resolveSurface({ role: 'chrome', state: 'hover' }).background;
    color = getTextStyle('primary', 2).color;
  }

  const navItemStyle = {
    // Hover and focus are the browser's job now — no setState, no re-render.
    //
    // An active item keeps its own look in every state; an inactive one lifts
    // one half-step up the ladder on hover.
    //
    // The hover value used to be `resolveSurface({ role: 'chrome' })` — the
    // chrome level itself, which is the bar the item sits on. Measured: the
    // item's hover fill was `var(--liminal-s1)` on a sidebar filled with
    // `var(--liminal-s1)`, so the hover was invisible. The producer's default
    // is one half-step above, which is what contract §11b requires.
    ...resolveInteractionVars({
      role: 'chrome',
      idle: bg,
      frozen: active ? bg : undefined,
    }),
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    padding: `${NAV_ITEM_PAD_Y}px ${SPACING[3]}px`,
    borderRadius: `${RADIUS[8]}px`, // 8px
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontFamily: 'inherit',
    fontWeight: active ? 500 : 400,
    textDecoration: 'none',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    // NO `background` here — see the note above.
    color,
    boxShadow: 'none', // Strictly no shadow for nav items
    opacity: disabled ? 0.35 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: LiminalMotionEngine.TRANSITION.hover,
    userSelect: 'none',
    width: '100%',
    textAlign: 'start',
    ...customStyle,
  } as CSSProperties;

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
        data-liminal-surface=""
        data-liminal-disabled={disabled ? "" : undefined}
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
      data-liminal-surface=""
      data-liminal-disabled={disabled ? "" : undefined}
      aria-current={active ? 'page' : undefined}
    >
      {renderIcon()}
      {children}
    </button>
  );
}

export default NavItem;
