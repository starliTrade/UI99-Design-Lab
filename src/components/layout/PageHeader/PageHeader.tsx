import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  getTextStyle,
} from '../../../engine/spec-engine';
import { resolveSurface } from '../../../engine/liminal-surface';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

/** A layout decision this component owns, not a system token. */
const HEADER_MAX_WIDTH = 640;
/** A layout decision this component owns, not a system token. */
const HEADER_MIN_WIDTH = 240;

export interface PageHeaderProps {
  breadcrumb?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  actions,
  className = '',
  style: customStyle = {},
}: PageHeaderProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Surface 1 with Rim 1 (flat zero-shadow container)
  // A structural surface: the level of the frame around the work, with a quiet
  // edge, and it does not answer the pointer.
  const limStyle = resolveSurface({ role: 'chrome', interactive: false });

  const containerStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow per LIMINAL layout rules
    borderRadius: `${RADIUS.card}px`, // 16px
    padding: `${SPACING[5]}px`, // 24px
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[3]}px`, // 12px
    boxSizing: 'border-box',
    width: '100%',
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(7), // 33px
    lineHeight: TYPOGRAPHY[7].lh,
    letterSpacing: TYPOGRAPHY[7].ls,
    fontWeight: 700,
    color: getTextStyle('primary', 1).color,
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(3), // 16px
    lineHeight: TYPOGRAPHY[3].lh,
    letterSpacing: TYPOGRAPHY[3].ls,
    color: getTextStyle('secondary', 1).color,
    maxWidth: HEADER_MAX_WIDTH,
    margin: 0,
    marginTop: `${SPACING[1]}px`,
  };

  return (
    <div className={`liminal-page-header ${className}`} style={containerStyle}>
      {/* 1. Breadcrumb slot */}
      {breadcrumb && (
        <div style={{ marginBottom: `${SPACING[1]}px` }}>
          {breadcrumb}
        </div>
      )}

      {/* 2. Title & Actions Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: `${SPACING[4]}px`,
          width: '100%',
        }}
      >
        <div style={{ flex: 1, minWidth: HEADER_MIN_WIDTH }}>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${SPACING[2]}px`,
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
