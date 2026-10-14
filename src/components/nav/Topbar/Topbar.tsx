import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLadderColor, VEIL } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveBorder, resolveSurface } from '../../../engine/liminal-surface';

export interface TopbarProps {
  logo?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Topbar({
  logo,
  children,
  actions,
  sticky = true,
  className = '',
  style: customStyle = {},
}: TopbarProps) {
  const SPACING = LiminalLayoutEngine.SPACING;

  // rimSide half-step S1.5 (#090A0D) for bottom border (harmonious with Divider)
  // The topbar is chrome: its bottom edge separates it from the work surface.
  const borderBottomColor = resolveBorder({ role: 'chrome', kind: 'hairline' });

  const topbarStyle: CSSProperties = {
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 50,
    height: `${SPACING[8]}px`,
    padding: `0 ${SPACING[5]}px`, // 24px
    background: resolveSurface({ role: 'chrome', interactive: false }).background, // Canvas #060709 with alpha 0.85
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${borderBottomColor}`,
    boxShadow: 'none', // Strictly no shadow per LIMINAL spec
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[5]}px`, // 24px
    boxSizing: 'border-box',
    width: '100%',
    ...customStyle,
  };

  return (
    <header className={className} style={topbarStyle}>
      {logo && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {logo}
        </div>
      )}

      {children && (
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${SPACING[3]}px`, // 12px
            marginInlineEnd: 'auto',
          }}
        >
          {children}
        </nav>
      )}

      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${SPACING[3]}px`,
            marginInlineStart: children ? undefined : 'auto',
            flexShrink: 0,
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
}

export default Topbar;
