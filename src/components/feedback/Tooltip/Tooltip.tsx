import React, { useState, useRef, useEffect, useId } from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent } from 'react';
import {
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  SHADOWS,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom';
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
  style: customStyle = {},
}: TooltipProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  const RADIUS = LiminalLayoutEngine.RADIUS;

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        hideTooltip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Neutral element: Surface 4 with Rim 2 and Sub-Canvas Shadow SHADOWS[2]
  const rim = getDirectionalRim(4, 2, false);
  const arrowColor = getLadderColor(4); // Surface 4 color #101115

  const isTop = position === 'top';

  const tooltipBoxStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    ...(isTop ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
    zIndex: 60,
    background: rim ? rim.cssBackground : arrowColor,
    border: rim ? '1px solid transparent' : 'none',
    boxShadow: SHADOWS[2],
    borderRadius: `${RADIUS[8]}px`, // 8px
    padding: '6px 12px',
    maxWidth: '240px',
    fontSize: '12px',
    lineHeight: 1.4,
    color: getTextStyle('primary', 4).color,
    pointerEvents: 'none',
    whiteSpace: 'normal',
    textAlign: 'center',
    animation: isTop
      ? 'liminalTooltipFadeTop 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'liminalTooltipFadeBottom 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    ...customStyle,
  };

  const arrowStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    width: '8px',
    height: '8px',
    background: arrowColor,
    transform: 'translateX(-50%) rotate(45deg)',
    zIndex: 59,
    ...(isTop
      ? { bottom: '-4px', borderBottom: `1px solid rgba(255, 255, 255, 0.06)`, borderRight: `1px solid rgba(255, 255, 255, 0.06)` }
      : { top: '-4px', borderTop: `1px solid rgba(255, 255, 255, 0.12)`, borderLeft: `1px solid rgba(255, 255, 255, 0.12)` }),
  };

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={visible ? tooltipId : undefined}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}

      {visible && (
        <div id={tooltipId} role="tooltip" style={tooltipBoxStyle}>
          {content}
          <div style={arrowStyle} />
        </div>
      )}

      <style>{`
        @keyframes liminalTooltipFadeTop {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes liminalTooltipFadeBottom {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </span>
  );
}

export default Tooltip;
