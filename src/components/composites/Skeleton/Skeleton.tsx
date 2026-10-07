import React from 'react';
import type { CSSProperties } from 'react';
import { getLadderColor } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface SkeletonProps {
  variant?: 'text' | 'title' | 'circle' | 'card' | 'custom';
  width?: string | number;
  height?: string | number;
  count?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  borderRadius,
  className = '',
  style: customStyle = {},
}: SkeletonProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;

  const s2Color = getLadderColor(2); // Surface 2 #0A0B0F
  const s25Color = getLadderColor(2.5); // Half-step S2.5 #0B0C10

  // Dimensions by variant
  let defWidth: string | number = '100%';
  let defHeight: string | number = '12px';
  let defRadius: number | string = `${RADIUS.chip}px`; // 6px

  switch (variant) {
    case 'text':
      defWidth = '100%';
      defHeight = '12px';
      defRadius = `${RADIUS.chip}px`; // 6px
      break;
    case 'title':
      defWidth = '40%';
      defHeight = '20px';
      defRadius = `${RADIUS.chip}px`; // 6px
      break;
    case 'circle':
      defWidth = '44px';
      defHeight = '44px';
      defRadius = '50%';
      break;
    case 'card':
      defWidth = '100%';
      defHeight = '120px';
      defRadius = `${RADIUS.card}px`; // 16px
      break;
    case 'custom':
      defWidth = width ?? '100%';
      defHeight = height ?? '16px';
      defRadius = borderRadius !== undefined ? `${borderRadius}px` : `${RADIUS.control}px`;
      break;
  }

  const finalWidth = width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : defWidth;
  const finalHeight = height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : defHeight;
  const finalRadius = borderRadius !== undefined ? `${borderRadius}px` : defRadius;

  const baseItemStyle: CSSProperties = {
    width: finalWidth,
    height: finalHeight,
    borderRadius: finalRadius,
    background: s2Color,
    animation: 'liminalPulse 1.6s ease-in-out infinite',
    boxSizing: 'border-box',
    border: 'none',
    boxShadow: 'none',
    flexShrink: 0,
    ...customStyle,
  };

  const renderSingle = (key?: number) => (
    <div
      key={key}
      className={`liminal-skeleton ${className}`}
      style={baseItemStyle}
      aria-busy="true"
      aria-label="Loading"
      role="status"
    />
  );

  return (
    <>
      <style>{`
        @keyframes liminalPulse {
          0%, 100% {
            background-color: ${s2Color};
          }
          50% {
            background-color: ${s25Color};
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .liminal-skeleton {
            animation: none !important;
            background-color: ${s2Color} !important;
          }
        }
      `}</style>

      {count > 1 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${SPACING[2]}px`, // 8px
            width: typeof finalWidth === 'string' && finalWidth.includes('%') ? finalWidth : '100%',
          }}
        >
          {Array.from({ length: count }).map((_, i) => renderSingle(i))}
        </div>
      ) : (
        renderSingle()
      )}
    </>
  );
}

export default Skeleton;
