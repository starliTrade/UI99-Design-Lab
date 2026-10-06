import React from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: 1 | 2 | 3 | 4;
  isFeatured?: boolean;
  surfaceLevel?: 1 | 2 | 3 | 4;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  elevation,
  isFeatured = false,
  surfaceLevel = 1,
  radius = LiminalLayoutEngine.RADIUS.container,
  className = '',
  style: userStyle,
}: CardProps) {
  const cardStyle = getLiminalStyle({
    surfaceLevel,
    isContainer: true,
    isFeatured,
    isFloating: Boolean(elevation),
    elevation,
  });

  return (
    <div
      className={`font-mono transition-all overflow-hidden ${className}`}
      style={{
        ...cardStyle.style,
        borderRadius: `${radius}px`,
        ...userStyle,
      }}
    >
      {(title || subtitle || action) && (
        <div
          className="p-4 sm:p-5 flex items-center justify-between"
          style={{
            borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
          }}
        >
          <div>
            {title && (
              <div
                className="font-bold text-xs sm:text-sm tracking-tight"
                style={{ color: SpecEngine.getTextStyle('primary', surfaceLevel).color }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                className="text-[10px] mt-0.5"
                style={getTextStyle('tertiary', surfaceLevel)}
              >
                {subtitle}
              </div>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>

      {footer && (
        <div
          className="px-4 py-3 sm:px-5 flex items-center justify-between text-xs"
          style={{
            borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
