import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  getLiminalStyle,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';

export interface StatProps {
  label: string;
  value: string | number;
  trend?: {
    direction?: 'up' | 'down' | 'neutral';
    value: string;
    semantic?: 'success' | 'warning' | 'danger' | 'info';
  };
  change?: string;
  changeType?: string;
  meta?: string;
  icon?: ReactNode;
  subtitle?: string;
  prefix?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Stat({
  label,
  value,
  trend,
  change,
  changeType,
  meta,
  icon,
  subtitle,
  prefix,
  className = '',
  style: customStyle = {},
}: StatProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const resolvedTrend = trend ?? (change ? {
    value: change,
    semantic: (changeType === 'negative' ? 'danger' : 'success') as 'success' | 'danger',
  } : undefined);
  const resolvedPrefix = prefix ?? icon;
  const resolvedSubtitle = subtitle ?? meta;

  // Surface 1 with Rim 1, flat zero shadow
  const limStyle = getLiminalStyle({
    surfaceLevel: 1,
    isContainer: true,
    interactive: false,
    state: 'idle',
  });

  const cardStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for flat stats card
    borderRadius: `${RADIUS.card}px`, // 16px
    padding: `${SPACING[5]}px`, // 24px
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[2]}px`, // 8px
    boxSizing: 'border-box',
    ...customStyle,
  };

  const labelStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
    lineHeight: TYPOGRAPHY[1].lh,
    letterSpacing: '+0.04em',
    fontWeight: 400,
    color: getTextStyle('tertiary', 1).color,
    userSelect: 'none',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[1]}px`,
  };

  const valueStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[6].fs}px`, // 28px
    lineHeight: TYPOGRAPHY[6].lh,
    letterSpacing: '-0.015em',
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    direction: 'ltr',
    textAlign: 'right',
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
    lineHeight: TYPOGRAPHY[1].lh,
    color: getTextStyle('quaternary', 1).color,
    margin: 0,
  };

  // Trend badge resolution
  let trendBg = SEMANTICS.SUCCESS.subtle;
  let trendColor = SEMANTICS.SUCCESS.text;
  let trendBorder = SEMANTICS.SUCCESS.border;

  if (resolvedTrend?.semantic) {
    const key = resolvedTrend.semantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
    const s = SEMANTICS[key] ?? SEMANTICS.SUCCESS;
    trendBg = s.subtle;
    trendColor = s.text;
    trendBorder = s.border;
  }

  return (
    <div className={className} style={cardStyle}>
      {/* Header row: label + trend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${SPACING[2]}px`,
        }}
      >
        <div style={labelStyle}>
          {resolvedPrefix && <span style={{ flexShrink: 0 }}>{resolvedPrefix}</span>}
          <span>{label}</span>
        </div>

        {resolvedTrend && (
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: `${RADIUS.full}px`,
              fontWeight: 500,
              letterSpacing: '+0.04em',
              background: trendBg,
              color: trendColor,
              border: `1px solid ${trendBorder}`,
              display: 'inline-flex',
              alignItems: 'center',
              userSelect: 'none',
              lineHeight: 1.4,
            }}
          >
            {resolvedTrend.value}
          </span>
        )}
      </div>

      {/* Primary Value */}
      <div style={valueStyle}>{value}</div>

      {/* Subtitle */}
      {resolvedSubtitle && <div style={subtitleStyle}>{resolvedSubtitle}</div>}
    </div>
  );
}

export default Stat;
