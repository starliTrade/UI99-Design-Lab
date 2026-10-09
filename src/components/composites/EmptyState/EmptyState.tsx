import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { Tray } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  className = '',
  style: customStyle = {},
}: EmptyStateProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Well concave rim: light from bottom (recess sensation) via getDirectionalRim(n, 2, true)
  const wellRim = getDirectionalRim(1.5, 2, true);

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: `${SPACING[7]}px ${SPACING[5]}px`, // 48px 24px
    gap: `${SPACING[4]}px`, // 16px
    boxSizing: 'border-box',
    width: '100%',
    boxShadow: 'none',
    ...customStyle,
  };

  const wellStyle: CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    background: wellRim ? wellRim.cssBackground : getLadderColor(1.5),
    color: getTextStyle('tertiary', 1).color,
    boxShadow: 'none',
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[5].fs}px`, // 23px
    lineHeight: TYPOGRAPHY[5].lh,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
  };

  const descStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: 1.7,
    color: getTextStyle('secondary', 1).color,
    maxWidth: '360px',
    margin: 0,
  };

  return (
    <div className={`liminal-empty-state ${className}`} style={wrapperStyle}>
      {/* Icon Well: Inverted concave rim */}
      <div style={wellStyle}>
        {icon || <LiminalIcon icon={Tray} size="md" weight="light" />}
      </div>

      {/* Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${SPACING[2]}px`, alignItems: 'center' }}>
        <h3 style={titleStyle}>{title}</h3>
        {description && <p style={descStyle}>{description}</p>}
      </div>

      {/* Actions */}
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${SPACING[2]}px`,
            marginTop: `${SPACING[1]}px`,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
