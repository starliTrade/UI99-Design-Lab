import React, { useState, useRef, useId, useEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useFloating } from '../../../engine/liminal-floating';
import { type Placement } from '../../../engine/liminal-positioning-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import {
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  SHADOWS,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * SimpleTooltip · Migrated Implementation using Portal & Positioning Engine
 * Features:
 * - Dynamic collision detection & auto-flip (top ↔ bottom, left ↔ right)
 * - Viewport boundary clamping (shift) to prevent offscreen overflow
 * - Rendered in <body> via LiminalPortal (zero z-index/overflow stacking context issues)
 * - Accessible: keyboard focus, Escape dismiss, click outside dismiss, role="tooltip"
 * - Optical specs: Surface 4 (#101115), Rim 2 Directional Specular, Elevation E2 Shadow
 */
export function SimpleTooltip({
  content,
  children,
  placement = 'top',
  delay = 150,
  className = '',
  style: customStyle = {},
}: SimpleTooltipProps) {
  const { triggerRef, floatingRef, position, isOpen, open, close } = useFloating({
    placement,
    offset: { x: 8, y: 8 },
    flip: true,
    shift: true,
    arrow: true,
  });

  const [showTimeout, setShowTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    if (showTimeout) clearTimeout(showTimeout);
    const timeout = setTimeout(open, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    close();
  };

  useEffect(() => {
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
    };
  }, [showTimeout]);

  // Surface 4 with Rim 2 and Sub-Canvas Shadow
  const rim = getDirectionalRim(4, 2, false);
  const arrowColor = getLadderColor(4); // Surface 4 (#101115)
  const controlRadius = LiminalLayoutEngine.RADIUS.control; // 10px

  // Dynamic arrow alignment based on actual resolved placement
  const getArrowStyle = (): CSSProperties => {
    const isTop = position.placement.startsWith('top');
    const isBottom = position.placement.startsWith('bottom');
    const isLeft = position.placement.startsWith('left');
    const isRight = position.placement.startsWith('right');

    const base: CSSProperties = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      backgroundColor: arrowColor,
      zIndex: 1001,
      transform: 'rotate(45deg)',
    };

    if (isTop) {
      return {
        ...base,
        bottom: '-4px',
        left: position.arrowX ? `${position.arrowX - 4}px` : 'calc(50% - 4px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      };
    }
    if (isBottom) {
      return {
        ...base,
        top: '-4px',
        left: position.arrowX ? `${position.arrowX - 4}px` : 'calc(50% - 4px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
      };
    }
    if (isLeft) {
      return {
        ...base,
        right: '-4px',
        top: position.arrowY ? `${position.arrowY - 4}px` : 'calc(50% - 4px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      };
    }
    if (isRight) {
      return {
        ...base,
        left: '-4px',
        top: position.arrowY ? `${position.arrowY - 4}px` : 'calc(50% - 4px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      };
    }

    return base;
  };

  return (
    <>
      <div
        ref={triggerRef as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-describedby={isOpen ? tooltipId : undefined}
        style={{ display: 'inline-flex' }}
        className={className}
      >
        {children}
      </div>

      {isOpen && (
        <LiminalPortal>
          <div
            id={tooltipId}
            role="tooltip"
            ref={floatingRef as any}
            style={{
              position: 'fixed',
              top: `${position.y}px`,
              left: `${position.x}px`,
              zIndex: 1000,
              background: rim ? rim.cssBackground : arrowColor,
              border: rim ? '1px solid transparent' : 'none',
              boxShadow: SHADOWS[2],
              borderRadius: `${controlRadius}px`,
              padding: '6px 12px',
              maxWidth: '260px',
              fontSize: '12px',
              lineHeight: 1.4,
              color: getTextStyle('primary', 4).color,
              pointerEvents: 'none',
              whiteSpace: 'normal',
              textAlign: 'center',
              userSelect: 'none',
              animation: position.placement.startsWith('top')
                ? 'liminalTooltipFadeTop 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'liminalTooltipFadeBottom 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              ...customStyle,
            }}
          >
            {content}
            <div style={getArrowStyle()} />
          </div>

          <style>{`
            @keyframes liminalTooltipFadeTop {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes liminalTooltipFadeBottom {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </LiminalPortal>
      )}
    </>
  );
}

export default SimpleTooltip;
