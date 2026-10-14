import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle } from '../../../engine/spec-engine';
import { SurfaceProvider } from '../../../engine/liminal-surface-context';
import { resolveSurface } from '../../../engine/liminal-surface';
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
        gap: `${SPACING[0]}px`,
        ...customStyle,
      }}
    >
      <div
        style={{
          fontSize: LiminalLayoutEngine.getTypeSizeCss(1), // 11px
          lineHeight: TYPOGRAPHY[1].lh,
          letterSpacing: '+0.08em',
          textTransform: 'uppercase',
          fontWeight: 400,
          // A section label is read. See Footer.
          color: getTextStyle('tertiary', 1).color,
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
  // A structural surface: the level of the frame around the work, with a quiet
  // edge, and it does not answer the pointer.
  const limStyle = resolveSurface({ role: 'chrome', interactive: false });

  const sidebarStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for sidebar
    borderRadius: `${RADIUS.card}px`, // 16px
    padding: `${SPACING[4]}px`, // 16px
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[0]}px`,
    width: `${width}px`,
    maxWidth: '100%',
    boxSizing: 'border-box',
    ...(sticky
      ? {
          position: 'sticky',
          top: `${SPACING[8] + SPACING[5]}px`, // 64 (topbar) + 24 (gap),
          alignSelf: 'flex-start',
        }
      : {}),
    ...customStyle,
  };

  return (
    // A SIDEBAR DECLARES ITSELF, so the controls inside it know what hosts them.
    //
    // Without this they read the default host — `work` — and an Input in the
    // sidebar landed at S3 on a chrome surface: two steps above the thing it
    // sits on. The engine's rule is that a control is defined by its
    // RELATIONSHIP to its host, and a host that does not say what it is leaves
    // every control inside it guessing.
    <SurfaceProvider role="chrome">
    <aside className={`liminal-sidebar ${className}`} style={sidebarStyle}>
      {children}
      <style>{`
        /* A sidebar that fills the width cannot also be sticky beside content —
           below the shell breakpoint it stacks instead. The same width as the
           shell, because it is the same event. */
        @media (width < ${LiminalLayoutEngine.BREAKPOINTS.shellSidebar}px) {
          .liminal-sidebar {
            width: 100% !important;
            position: static !important;
          }
        }
      `}</style>
    </aside>
    </SurfaceProvider>
  );
}

Sidebar.Section = SidebarSection;
Sidebar.Item = NavItem;

export default Sidebar;
