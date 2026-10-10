import React, {
  forwardRef,
  useCallback,
} from 'react';
import type {
  CSSProperties,
  ReactNode,
  KeyboardEvent,
  HTMLAttributes,
} from 'react';
import {
  getLadderColor,
  getDirectionalRim,
  SHADOWS,
  Z_INDEX,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import {
  useFocusTrap,
  useReducedMotion,
} from '../../../engine/liminal-hooks';
import { Slot } from '../../../engine/liminal-slot';
import { useDropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  minWidth?: number;
  loop?: boolean;
}

const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"])';

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  (
    {
      asChild = false,
      children,
      className = '',
      style: customStyle = {},
      minWidth = 190,
      loop = true,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { isOpen, close, floatingRef, position } = useDropdownMenuContext();
    const reducedMotion = useReducedMotion();

    // Focus trap manages Tab-key looping and initial focus
    useFocusTrap(floatingRef, isOpen, { autoFocus: true, restoreFocus: true });

    // Arrow keys roving navigation handler (coordinating with focus trap without conflict)
    const handleRovingKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          close();
          return;
        }

        const container = floatingRef.current;
        if (!container) return;

        const items = Array.from(
          container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)
        );
        if (items.length === 0) return;

        const currentIndex = items.indexOf(document.activeElement as HTMLElement);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          let nextIndex = currentIndex + 1;
          if (nextIndex >= items.length) {
            nextIndex = loop ? 0 : items.length - 1;
          }
          items[nextIndex]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          let prevIndex = currentIndex - 1;
          if (prevIndex < 0) {
            prevIndex = loop ? items.length - 1 : 0;
          }
          items[prevIndex]?.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          items[0]?.focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1]?.focus();
        }
      },
      [close, floatingRef, loop, onKeyDown]
    );

    if (!isOpen) return null;

    const SPACING = LiminalLayoutEngine.SPACING;
    const RADIUS = LiminalLayoutEngine.RADIUS;
    const mist = LiminalColorEngine.getMistStyle(LiminalColorEngine.BRAND_PRIMARY.hex, 'quiet');
    const rim = getDirectionalRim(2, 1, false);

    const basePanelStyle: CSSProperties = {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: Z_INDEX.dropdown,
      minWidth: `${minWidth}px`,
      background: rim ? rim.cssBackground : mist.background,
      backdropFilter: mist.backdropFilter,
      WebkitBackdropFilter: mist.WebkitBackdropFilter,
      boxShadow: `${SHADOWS[2]}, ${mist.boxShadow}`,
      borderRadius: `${RADIUS.control}px`,
      padding: `${SPACING[1]}px`,
      border: rim ? '1px solid transparent' : `1px solid ${getLadderColor(2.5)}`,
      outline: 'none',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: `${SPACING[1] / 2}px`,
      animation: reducedMotion ? 'none' : LiminalMotionEngine.scaleIn(0.96),
      pointerEvents: 'auto',
      ...customStyle,
    };

    const combinedRef = (node: HTMLDivElement | null) => {
      (floatingRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    const contentProps = {
      role: 'menu' as const,
      'aria-orientation': 'vertical' as const,
      tabIndex: -1,
      className,
      style: basePanelStyle,
      onKeyDown: handleRovingKeyDown,
      ...props,
    };

    if (asChild) {
      return (
        <LiminalPortal>
          <Slot ref={combinedRef as any} {...contentProps}>
            {children}
          </Slot>
        </LiminalPortal>
      );
    }

    return (
      <LiminalPortal>
        <div ref={combinedRef} {...contentProps}>
          {/* Mist halo layer */}
          {mist.ringLayer && <div style={mist.ringLayer as CSSProperties} />}
          {children}
        </div>
      </LiminalPortal>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';
