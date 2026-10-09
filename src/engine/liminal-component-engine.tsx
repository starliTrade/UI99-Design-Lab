/**
 * LIMINAL · COMPONENT INTERACTION ENGINE & SURFACE RESOLVER
 * "DNA هر کامپوننت لیمینال — مدیریت حالت‌های انسانی، نور و دسترسی‌پذیری"
 * 
 * Central foundation for all interactive and structural Liminal components.
 * Standardizes:
 * 1. Interaction state machine (idle, hover, active, focus, disabled)
 * 2. Keyboard vs pointer focus isolation (:focus-visible logic)
 * 3. Optical rim & surface level derivation via Spec Engine
 * 4. Canonical motion binding via LiminalMotionEngine
 * 5. Strict accessibility (ARIA roles, keyboard nav, disabled states)
 */

import React, { useState, useCallback, useMemo, forwardRef } from 'react';
import type {
  CSSProperties,
  ReactNode,
  MouseEvent,
  FocusEvent,
  KeyboardEvent,
  ElementType,
  ComponentPropsWithRef,
} from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  LiminalState,
  DirectionalRimResult,
} from './spec-engine';
import { LiminalColorEngine } from './liminal-color-engine';
import { LiminalLayoutEngine } from './liminal-layout-engine';
import { LiminalMotionEngine } from './liminal-motion-engine';

// ===== INTERACTION OPTIONS & RESULT =====
export interface UseLiminalInteractionOptions {
  disabled?: boolean;
  forcedState?: LiminalState;
  onMouseEnter?: (e: MouseEvent<any>) => void;
  onMouseLeave?: (e: MouseEvent<any>) => void;
  onMouseDown?: (e: MouseEvent<any>) => void;
  onMouseUp?: (e: MouseEvent<any>) => void;
  onFocus?: (e: FocusEvent<any>) => void;
  onBlur?: (e: FocusEvent<any>) => void;
  onKeyDown?: (e: KeyboardEvent<any>) => void;
  onKeyUp?: (e: KeyboardEvent<any>) => void;
}

export interface UseLiminalInteractionReturn<E extends HTMLElement = HTMLElement> {
  currentState: LiminalState;
  isKeyboardFocused: boolean;
  isHovered: boolean;
  isActive: boolean;
  isFocused: boolean;
  handlers: {
    onMouseEnter: (e: MouseEvent<E>) => void;
    onMouseLeave: (e: MouseEvent<E>) => void;
    onMouseDown: (e: MouseEvent<E>) => void;
    onMouseUp: (e: MouseEvent<E>) => void;
    onFocus: (e: FocusEvent<E>) => void;
    onBlur: (e: FocusEvent<E>) => void;
    onKeyDown: (e: KeyboardEvent<E>) => void;
    onKeyUp: (e: KeyboardEvent<E>) => void;
  };
  ariaProps: {
    'aria-disabled'?: boolean;
    tabIndex?: number;
  };
}

/**
 * Canonical Hook: useLiminalInteraction
 * Manages the full interactive lifecycle of a Liminal element.
 * Guarantees zero spurious focus rings from mouse clicks.
 */
export function useLiminalInteraction<E extends HTMLElement = HTMLElement>(
  options: UseLiminalInteractionOptions = {}
): UseLiminalInteractionReturn<E> {
  const {
    disabled = false,
    forcedState,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
  } = options;

  const [internalState, setInternalState] = useState<LiminalState>('idle');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const currentState: LiminalState = useMemo(() => {
    if (disabled) return 'disabled';
    if (forcedState) return forcedState;
    return internalState;
  }, [disabled, forcedState, internalState]);

  const handleMouseEnter = useCallback(
    (e: MouseEvent<E>) => {
      if (!disabled && !forcedState) {
        setInternalState('hover');
      }
      onMouseEnter?.(e);
    },
    [disabled, forcedState, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: MouseEvent<E>) => {
      if (!disabled && !forcedState) {
        setInternalState('idle');
      }
      onMouseLeave?.(e);
    },
    [disabled, forcedState, onMouseLeave]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<E>) => {
      setIsKeyboardFocused(false);
      if (!disabled && !forcedState) {
        setInternalState('active');
      }
      onMouseDown?.(e);
    },
    [disabled, forcedState, onMouseDown]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent<E>) => {
      if (!disabled && !forcedState) {
        setInternalState('hover');
      }
      onMouseUp?.(e);
    },
    [disabled, forcedState, onMouseUp]
  );

  const handleFocus = useCallback(
    (e: FocusEvent<E>) => {
      if (!disabled && !forcedState) {
        setInternalState('focus');
      }
      onFocus?.(e);
    },
    [disabled, forcedState, onFocus]
  );

  const handleBlur = useCallback(
    (e: FocusEvent<E>) => {
      if (!disabled && !forcedState) {
        setInternalState('idle');
      }
      setIsKeyboardFocused(false);
      onBlur?.(e);
    },
    [disabled, forcedState, onBlur]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<E>) => {
      if (e.key === 'Tab') {
        setIsKeyboardFocused(true);
      }
      onKeyDown?.(e);
    },
    [onKeyDown]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent<E>) => {
      onKeyUp?.(e);
    },
    [onKeyUp]
  );

  return {
    currentState,
    isKeyboardFocused,
    isHovered: currentState === 'hover',
    isActive: currentState === 'active',
    isFocused: currentState === 'focus',
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
    },
    ariaProps: {
      'aria-disabled': disabled ? true : undefined,
      tabIndex: disabled ? -1 : undefined,
    },
  };
}

// ===== ENGINE CLASS & STYLE RESOLVER =====
export interface ResolvedLiminalStyle {
  style: CSSProperties;
  rim: DirectionalRimResult | null;
  surfaceLevel: number;
  ladderColor: string;
}

export function getFocusRing(isKeyboardFocused: boolean, colorHex?: string): CSSProperties {
  return LiminalComponentEngine.getFocusRing(isKeyboardFocused, colorHex);
}

export class LiminalComponentEngine {
  /**
   * Resolves standard focus ring:
   * Brand primary outline (or custom colorHex) on genuine keyboard focus, none on pointer focus.
   */
  static getFocusRing(isKeyboardFocused: boolean, colorHex?: string): CSSProperties {
    if (!isKeyboardFocused) {
      return {
        outline: 'none',
      };
    }
    return {
      outline: `2px solid ${colorHex || LiminalColorEngine.BRAND_PRIMARY.hex}`,
      outlineOffset: '2px',
    };
  }

  /**
   * Resolves complete interactive surface style.
   */
  static resolveInteractiveSurface(options: {
    surfaceLevel?: number;
    state?: LiminalState;
    isKeyboardFocused?: boolean;
    rimTier?: 0 | 1 | 2 | 3;
    concave?: boolean;
    customTransition?: string;
  }): CSSProperties {
    const {
      surfaceLevel = 2,
      state = 'idle',
      isKeyboardFocused = false,
      rimTier = 2,
      concave = false,
      customTransition,
    } = options;

    const baseLiminal = getLiminalStyle({
      surfaceLevel,
      interactive: true,
      state,
      concave,
    });

    const focusRing = this.getFocusRing(state === 'focus' && isKeyboardFocused);
    const motionTransition = customTransition || LiminalMotionEngine.TRANSITION.normal;

    return {
      ...baseLiminal.style,
      ...focusRing,
      transition: motionTransition,
      boxSizing: 'border-box',
    };
  }
}

// ===== COMPONENT WRAPPER PATTERN (LiminalWrapper) =====
export interface LiminalWrapperProps<T extends ElementType = 'div'> {
  as?: T;
  surfaceLevel?: number;
  interactive?: boolean;
  disabled?: boolean;
  forcedState?: LiminalState;
  concave?: boolean;
  rimTier?: 0 | 1 | 2 | 3;
  transition?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export type LiminalWrapperComponentProps<T extends ElementType = 'div'> = LiminalWrapperProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof LiminalWrapperProps<T>>;

export const LiminalWrapper = forwardRef(function LiminalWrapper<T extends ElementType = 'div'>(
  {
    as,
    surfaceLevel = 2,
    interactive = false,
    disabled = false,
    forcedState,
    concave = false,
    rimTier = 2,
    transition = LiminalMotionEngine.TRANSITION.normal,
    children,
    className = '',
    style: customStyle = {},
    ...restProps
  }: LiminalWrapperProps<T>,
  ref: any
) {
  const Component = as || 'div';

  const { currentState, isKeyboardFocused, handlers, ariaProps } = useLiminalInteraction({
    disabled,
    forcedState,
    onMouseEnter: (restProps as any).onMouseEnter,
    onMouseLeave: (restProps as any).onMouseLeave,
    onMouseDown: (restProps as any).onMouseDown,
    onMouseUp: (restProps as any).onMouseUp,
    onFocus: (restProps as any).onFocus,
    onBlur: (restProps as any).onBlur,
    onKeyDown: (restProps as any).onKeyDown,
    onKeyUp: (restProps as any).onKeyUp,
  });

  const computedStyle: CSSProperties = useMemo(() => {
    if (!interactive) {
      const base = getLiminalStyle({ surfaceLevel, interactive: false, concave });
      return {
        ...base.style,
        ...customStyle,
      };
    }

    const interactiveStyle = LiminalComponentEngine.resolveInteractiveSurface({
      surfaceLevel,
      state: currentState,
      isKeyboardFocused,
      rimTier,
      concave,
      customTransition: transition,
    });

    return {
      ...interactiveStyle,
      ...customStyle,
    };
  }, [interactive, surfaceLevel, concave, customStyle, currentState, isKeyboardFocused, rimTier, transition]);

  return (
    <Component
      ref={ref}
      className={className}
      style={computedStyle}
      {...(interactive ? handlers : {})}
      {...(interactive ? ariaProps : {})}
      {...restProps}
    >
      {children}
    </Component>
  );
}) as <T extends ElementType = 'div'>(
  props: LiminalWrapperComponentProps<T> & { ref?: any }
) => React.ReactElement | null;

export default LiminalComponentEngine;
