import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface BadgeProps {
  semantic?: 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Badge({
  semantic = 'info',
  children,
  className = '',
  style: customStyle = {},
}: BadgeProps) {
  const semanticKey = semantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  const role = LiminalColorEngine.SEMANTICS[semanticKey] ?? LiminalColorEngine.SEMANTICS.INFO;

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: role.subtle,
    border: `1px solid ${role.border}`,
    color: role.text,
    borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`, // 9999px (Pill is loud, allowed for badges)
    fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[1].fs}px`, // 11px
    letterSpacing: LiminalLayoutEngine.TYPOGRAPHY[1].ls, // +0.04em
    fontWeight: LiminalLayoutEngine.TYPOGRAPHY[2].weight, // 500
    padding: '3px 10px',
    lineHeight: 1.45,
    userSelect: 'none',
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <span className={className} style={badgeStyle}>
      {children}
    </span>
  );
}

export default Badge;
