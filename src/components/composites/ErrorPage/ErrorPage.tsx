import React from 'react';
import type { CSSProperties } from 'react';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { Button } from '../../atoms/Button';
import { Warning } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';

export interface ErrorPageProps {
  code: '404' | '500' | '403' | '401' | string;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  style?: CSSProperties;
}

export function ErrorPage({
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
  style: customStyle = {},
}: ErrorPageProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const isServerFatal = code === '500' || code === '503';
  const role = isServerFatal ? 'alert' : 'region';
  const ariaLive = isServerFatal ? 'assertive' : undefined;

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: `${SPACING[7]}px ${SPACING[5]}px`, // 48px 24px
    gap: `${SPACING[3]}px`, // 12px
    boxSizing: 'border-box',
    width: '100%',
    boxShadow: 'none',
    ...customStyle,
  };

  const codeStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[8].fs}px`, // 40px
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    color: getTextStyle('quaternary', 1).color, // Felt, not screaming
    margin: 0,
    userSelect: 'none',
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[6].fs}px`, // 28px
    lineHeight: TYPOGRAPHY[6].lh,
    letterSpacing: TYPOGRAPHY[6].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
  };

  const descStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: 1.7,
    color: getTextStyle('secondary', 1).color,
    maxWidth: '400px',
    margin: 0,
  };

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`liminal-error-page ${className}`}
      style={wrapperStyle}
    >
      {/* 1. Large Quaternary Status Code */}
      <div style={codeStyle}>{code}</div>

      {/* 2. Small 16px Alert Triangle — The Single Sharp Danger Signal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LiminalIcon icon={Warning} size="sm" weight="light" color={SEMANTICS.DANGER.solid} />
      </div>

      {/* 3. Primary Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${SPACING[2]}px`, alignItems: 'center' }}>
        <h2 style={titleStyle}>{title}</h2>
        {description && <p style={descStyle}>{description}</p>}
      </div>

      {/* 4. Actions Row */}
      {(primaryAction || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${SPACING[2]}px`,
            marginTop: `${SPACING[2]}px`,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {primaryAction && (
            <Button variant="secondary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorPage;
