import React, { useState, useRef, useId, useEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useFloating } from '../../../engine/liminal-floating';
import { type Placement } from '../../../engine/liminal-positioning-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { resolveBorder } from '../../../engine/liminal-surface';
import {
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  SHADOWS,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface } from '../../../engine/liminal-surface';

export interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  position?: string;
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
 * - Optical specs: Surface 4 (#101114), Rim 2 Directional Specular, Elevation E2 Shadow
 */
/** The arrow's edges continue the tooltip's own boundary, so they take the
 *  same derived hairline rather than four hand-tuned alphas. */
const arrowRim = resolveBorder({ role: 'popover', kind: 'hairline' });

export function SimpleTooltip({
  content,
  children,
  placement = 'top',
  position: positionProp,
  delay = 150,
  className = '',
  style: customStyle = {},
}: SimpleTooltipProps) {
  const effectivePlacement = (placement || positionProp || 'top') as Placement;
  const { triggerRef, floatingRef, position, isOpen, open, close } = useFloating({
    placement: effectivePlacement,
    offset: { x: 8, y: 8 },
    flip: true,
    shift: true,
    arrow: true,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const reduced = useReducedMotion();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(open, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    close();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // The tooltip is a floating menu surface; the arrow must match it exactly.
  const tooltipSurface = resolveSurface({ role: 'menu' });
  const rim = tooltipSurface.rimColors;
  const arrowColor = tooltipSurface.background;
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
        borderBottom: `1px solid ${arrowRim}`,
        borderRight: `1px solid ${arrowRim}`,
      };
    }
    if (isBottom) {
      return {
        ...base,
        top: '-4px',
        left: position.arrowX ? `${position.arrowX - 4}px` : 'calc(50% - 4px)',
        borderTop: `1px solid ${arrowRim}`,
        borderLeft: `1px solid ${arrowRim}`,
      };
    }
    if (isLeft) {
      return {
        ...base,
        right: '-4px',
        top: position.arrowY ? `${position.arrowY - 4}px` : 'calc(50% - 4px)',
        borderTop: `1px solid ${arrowRim}`,
        borderRight: `1px solid ${arrowRim}`,
      };
    }
    if (isRight) {
      return {
        ...base,
        left: '-4px',
        top: position.arrowY ? `${position.arrowY - 4}px` : 'calc(50% - 4px)',
        borderBottom: `1px solid ${arrowRim}`,
        borderLeft: `1px solid ${arrowRim}`,
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
              animation: reduced
                ? 'none'
                : position.placement.startsWith('top')
                ? `liminalTooltipFadeTop 0.15s ${LiminalMotionEngine.EASING.out}`
                : `liminalTooltipFadeBottom 0.15s ${LiminalMotionEngine.EASING.out}`,
              ...customStyle,
            }}
          >
            {content}
            <div style={getArrowStyle()} />
          </div>
        </LiminalPortal>
      )}
    </>
  );
}

export default SimpleTooltip;
