import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveBorder } from '../../../engine/liminal-surface';

export interface FooterProps {
  left?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Footer({
  left,
  children,
  className = '',
  style: customStyle = {},
}: FooterProps) {
  const SPACING = LiminalLayoutEngine.SPACING;

  // rimSide half-step S1.5 (#090A0D) for top border (harmonious with Divider)
  // The footer is chrome: its top edge separates it from the work surface.
  const borderTopColor = resolveBorder({ role: 'chrome', kind: 'hairline' });

  const footerStyle: CSSProperties = {
    marginTop: `${SPACING[8]}px`, // 64px
    paddingTop: `${SPACING[5]}px`, // 24px
    paddingBottom: `${SPACING[5]}px`, // 24px
    borderTop: `1px solid ${borderTopColor}`,
    background: 'transparent',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: `${SPACING[4]}px`, // 16px
    width: '100%',
    boxSizing: 'border-box',
    ...customStyle,
  };

  const leftStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
    lineHeight: 1.5,
    // Read text, not a placeholder: quaternary's floor is APCA Lc 30, which is
    // the minimum for ANY text. A footer is read. WCAG measured 4.06:1 there,
    // under the 4.5 AA asks for.
    color: getTextStyle('tertiary', 1).color,
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`,
  };

  const linksContainerStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: `${SPACING[4]}px`,
    color: getTextStyle('tertiary', 1).color,
  };

  return (
    <div className={`liminal-footer ${className}`} style={footerStyle}>
      {left && <div style={leftStyle}>{left}</div>}
      {children && <nav style={linksContainerStyle}>{children}</nav>}
    </div>
  );
}

export default Footer;
