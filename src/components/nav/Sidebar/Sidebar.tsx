import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLiminalStyle, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { NavItem, NavItemProps } from '../NavItem';

export interface SidebarProps {
  children?: ReactNode;
  width?: number;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface SidebarSectionProps {
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SidebarSection({
  label,
  children,
  className = '',
  style: customStyle = {},
}: SidebarSectionProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        ...customStyle,
      }}
    >
      <div
        style={{
          fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
          lineHeight: TYPOGRAPHY[1].lh,
          letterSpacing: '+0.08em',
          textTransform: 'uppercase',
          fontWeight: 400,
          color: getTextStyle('quaternary', 1).color,
          padding: `${SPACING[3]}px ${SPACING[3]}px ${SPACING[2]}px`,
          userSelect: 'none',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function Sidebar({
  children,
  width = 220,
  sticky = true,
  className = '',
  style: customStyle = {},
}: SidebarProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;

  // S1 + Rim 1 (flat zero-shadow container)
  const limStyle = getLiminalStyle({
    surfaceLevel: 1,
    isContainer: true,
    interactive: false,
    state: 'idle',
  });

  const sidebarStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for sidebar
    borderRadius: `${RADIUS.card}px`, // 16px
    padding: `${SPACING[4]}px`, // 16px
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    width: `${width}px`,
    maxWidth: '100%',
    boxSizing: 'border-box',
    ...(sticky
      ? {
          position: 'sticky',
          top: '88px',
          alignSelf: 'flex-start',
        }
      : {}),
    ...customStyle,
  };

  return (
    <aside className={`liminal-sidebar ${className}`} style={sidebarStyle}>
      {children}
    </aside>
  );
}

Sidebar.Section = SidebarSection;
Sidebar.Item = NavItem;

export default Sidebar;
