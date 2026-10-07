import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface PageSectionProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  divider?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PageSection({
  title,
  subtitle,
  actions,
  divider = false,
  children,
  className = '',
  style: customStyle = {},
}: PageSectionProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // rimSide half-step S1.5 (#090A0D) for top divider
  const rimSideColor = getLadderColor(1.5);

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[4]}px`, // 16px
    width: '100%',
    boxSizing: 'border-box',
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[5].fs}px`, // 23px
    lineHeight: TYPOGRAPHY[5].lh,
    letterSpacing: TYPOGRAPHY[5].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    color: getTextStyle('tertiary', 1).color,
    margin: 0,
  };

  return (
    <section className={`liminal-page-section ${className}`} style={wrapperStyle}>
      {/* 1. Optional Top Divider */}
      {divider && (
        <div
          role="separator"
          style={{
            height: '1px',
            background: rimSideColor,
            width: '100%',
            marginBottom: `${SPACING[5]}px`, // 24px
          }}
        />
      )}

      {/* 2. Section Header (if title, subtitle or actions exist) */}
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: `${SPACING[3]}px`,
            width: '100%',
          }}
        >
          <div>
            {title && <h2 style={titleStyle}>{title}</h2>}
            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
          </div>

          {actions && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${SPACING[2]}px`,
                flexWrap: 'wrap',
              }}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      {/* 3. Section Content Body */}
      <div style={{ width: '100%' }}>{children}</div>
    </section>
  );
}

export default PageSection;
