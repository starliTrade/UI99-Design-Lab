import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  createLiminalComponent,
  type LiminalComponentProps,
} from '../../../engine/liminal-component';
import {
  useLiminalInteraction,
  LiminalComponentEngine,
} from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import {
  getLadderColor,
  getTextStyle,
  LiminalState,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends LiminalComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  forcedState?: LiminalState;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button · Canonical Liminal Component Wrapper Pattern
 * Features:
 * - Built with createLiminalComponent factory (forwardRef, asChild, data-liminal-component)
 * - State machine via useLiminalInteraction (keyboard vs pointer focus isolation)
 * - Optical surfaces via LiminalComponentEngine.resolveInteractiveSurface
 * - Locked transitions via LiminalMotionEngine.TRANSITION.normal
 */
export const Button = createLiminalComponent<ButtonProps>(
  {
    displayName: 'Button',
    defaultElement: 'button',
    defaultProps: {
      variant: 'secondary',
      size: 'md',
      disabled: false,
      type: 'button',
    },
  },
  (props) => {
    const {
      variant = 'secondary',
      size = 'md',
      disabled = false,
      forcedState,
      icon,
      iconRight,
      fullWidth = false,
      children,
      onClick,
      type = 'button',
      className = '',
      style: customStyle = {},
      ref,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      ...restProps
    } = props;

    // 1. Interaction DNA Hook
    const { currentState, isKeyboardFocused, handlers, ariaProps } = useLiminalInteraction<HTMLButtonElement>({
      disabled,
      forcedState,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
    });

    // 2. Size token resolution from LiminalLayoutEngine
    const sizeStyles: Record<ButtonSize, CSSProperties> = {
      sm: {
        padding: '6px 12px',
        fontSize: '12px',
        minHeight: '32px',
        lineHeight: 1.4,
      },
      md: {
        padding: '10px 18px',
        fontSize: '13px',
        minHeight: '44px', // mobile touch target compliant
        lineHeight: 1.5,
      },
      lg: {
        padding: '12px 24px',
        fontSize: '15px',
        minHeight: '52px',
        lineHeight: 1.5,
      },
    };

    const baseFontWeight = LiminalLayoutEngine.TYPOGRAPHY[2].weight; // 500
    const controlRadius = LiminalLayoutEngine.RADIUS.control; // 10px

    // 3. Variant & Optical Surface Resolution
    let computedStyle: CSSProperties = {};

    if (variant === 'primary') {
      const brand = LiminalColorEngine.BRAND_PRIMARY;
      const stateStyle = LiminalColorEngine.getStateStyle({
        baseL: 0.90,
        baseColor: brand.hex,
        state: currentState,
      });

      const bg = currentState === 'hover' ? '#F5F7FA' : currentState === 'active' ? '#DDE1E8' : brand.hex;
      const outline = currentState === 'focus' && isKeyboardFocused ? stateStyle.outline : 'none';

      computedStyle = {
        background: bg,
        color: brand.onColor,
        border: 'none',
        outline,
        outlineOffset: '2px',
        opacity: stateStyle.opacity,
        transform: currentState === 'active' ? 'translateY(0.5px)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      };
    } else if (variant === 'secondary') {
      computedStyle = LiminalComponentEngine.resolveInteractiveSurface({
        surfaceLevel: 2,
        state: currentState,
        isKeyboardFocused,
        rimTier: 2,
      });
      computedStyle = {
        ...computedStyle,
        color: getTextStyle('primary', 2).color,
        cursor: disabled ? 'not-allowed' : 'pointer',
      };
    } else if (variant === 'ghost') {
      let ghostBg = 'transparent';
      if (currentState === 'hover') {
        ghostBg = getLadderColor(2.5);
      } else if (currentState === 'active') {
        ghostBg = getLadderColor(1.5);
      }

      computedStyle = LiminalComponentEngine.resolveInteractiveSurface({
        surfaceLevel: 2,
        state: currentState,
        isKeyboardFocused,
        rimTier: 2,
      });
      computedStyle = {
        ...computedStyle,
        background: ghostBg,
        border: 'none',
        color: getTextStyle('primary', 2).color,
        cursor: disabled ? 'not-allowed' : 'pointer',
      };
    } else if (variant === 'danger') {
      computedStyle = LiminalComponentEngine.resolveInteractiveSurface({
        surfaceLevel: 2,
        state: currentState,
        isKeyboardFocused,
        rimTier: 2,
      });
      computedStyle = {
        ...computedStyle,
        color: LiminalColorEngine.SEMANTICS.DANGER.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
      };
    }

    // 4. Composite Final Style with Liminal Motion Engine
    const finalStyle: CSSProperties = {
      fontFamily: 'inherit',
      fontWeight: baseFontWeight,
      borderRadius: `${controlRadius}px`,
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: `${LiminalLayoutEngine.SPACING[2]}px`, // 8px
      transition: LiminalMotionEngine.TRANSITION.normal,
      userSelect: 'none',
      boxSizing: 'border-box',
      textDecoration: 'none',
      ...sizeStyles[size],
      ...computedStyle,
      ...customStyle,
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        className={className}
        style={finalStyle}
        {...handlers}
        {...ariaProps}
        {...restProps}
      >
        {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
        {children}
        {iconRight && <span className="inline-flex items-center shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

export default Button;
