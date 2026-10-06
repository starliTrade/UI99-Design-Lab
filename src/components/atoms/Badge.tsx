import React from 'react';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export type BadgeSemantic = 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  semantic?: BadgeSemantic;
  hue?: number; // 15..350 from EXTENDED_SPECTRUM
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ semantic = 'info', hue, children, className = '', style: userStyle }: BadgeProps) {
  const colors = hue !== undefined
    ? (() => {
        const ext = LiminalColorEngine.EXTENDED_SPECTRUM.find((x) => x.hue === hue);
        return {
          sub: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.12)',
          txt: ext?.hex ?? '#8CC3F2',
        };
      })()
    : (() => {
        const key = semantic.toUpperCase() as keyof typeof LiminalColorEngine.SEMANTICS;
        const sem = LiminalColorEngine.SEMANTICS[key];
        return {
          sub: sem.subtle,
          border: sem.border,
          txt: sem.text,
        };
      })();

  return (
    <span
      className={`inline-flex items-center justify-center font-mono leading-none ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`, // Pill (Full) is loud, reserved for badges
        border: `1px solid ${colors.border}`,
        fontSize: '11px',
        letterSpacing: '0.04em',
        fontWeight: 500,
        background: colors.sub,
        color: colors.txt,
        ...userStyle,
      }}
    >
      {children}
    </span>
  );
}
