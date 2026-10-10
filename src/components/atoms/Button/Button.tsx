import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import {
  createLiminalComponent,
  type LiminalComponentProps,
} from '../../../engine/liminal-component';
import {
  useLiminalInteraction,
  LiminalComponentEngine,
} from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon, type IconSize } from '../../../engine/liminal-icon-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import {
  getLadderColor,
  getTextStyle,
  LiminalState,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import {
  createVariants,
  type VariantProps,
} from '../../../engine/liminal-variants';
import { Slot } from '../../../engine/liminal-slot';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * LIMINAL Button Variants (cva pattern with inline mathematical CSSProperties)
 */
export const buttonVariants = createVariants({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: LiminalLayoutEngine.TYPOGRAPHY[2].weight,
    cursor: 'pointer',
    userSelect: 'none',
    boxSizing: 'border-box',
    textDecoration: 'none',
    position: 'relative',
    transition: LiminalMotionEngine.TRANSITION.normal,
  },
  variants: {
    variant: {
      primary: {
        background: LiminalColorEngine.BRAND_PRIMARY.hex,
        color: LiminalColorEngine.BRAND_PRIMARY.onColor,
        border: 'none',
      },
      secondary: {
        ...LiminalComponentEngine.resolveInteractiveSurface({
          surfaceLevel: 2,
          state: 'idle',
          isKeyboardFocused: false,
          rimTier: 2,
        }),
        color: getTextStyle('primary', 2).color,
      },
      ghost: {
        background: 'transparent',
        border: 'none',
        color: getTextStyle('primary', 2).color,
      },
      danger: {
        background: LiminalColorEngine.SEMANTICS.DANGER.solid,
        color: 'rgba(255, 255, 255, 0.88)',
        border: 'none',
      },
      outline: {
        background: 'transparent',
        border: `1px solid ${LiminalColorEngine.getLadderColor(3)}`,
        color: getTextStyle('primary', 2).color,
      },
      link: {
        background: 'transparent',
        border: 'none',
        textDecoration: 'underline',
        color: getTextStyle('primary', 2).color,
      },
    },
    size: {
      sm: {
        padding: '6px 12px',
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[1].fs}px`,
        minHeight: '32px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
        lineHeight: 1.4,
      },
      md: {
        padding: '10px 18px',
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[2].fs}px`,
        minHeight: '44px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
        lineHeight: 1.5,
      },
      lg: {
        padding: `${LiminalLayoutEngine.SPACING[3]}px ${LiminalLayoutEngine.SPACING[5]}px`,
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[3].fs}px`,
        minHeight: '52px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
        lineHeight: 1.5,
      },
      icon: {
        padding: 0,
        width: '44px',
        height: '44px',
        minHeight: '44px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
      },
    },
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
});

export interface ButtonProps
  extends Omit<LiminalComponentProps<'button'>, 'onClick'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  forcedState?: LiminalState;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  iconOnly?: boolean;
  ariaLabel?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

/**
 * Button · Canonical Liminal Component Wrapper Pattern
 * Features:
 * - Built with createLiminalComponent factory (forwardRef, asChild, data-liminal-component)
 * - Powered by createVariants / buttonVariants engine
 * - Composition API with Slot (asChild pattern)
 * - State machine via useLiminalInteraction (keyboard vs pointer focus isolation)
 * - Optical surfaces via LiminalComponentEngine.resolveInteractiveSurface
 * - Locked transitions via LiminalMotionEngine
 * - Loading state with zero-layout-shift and Phosphor SpinnerGap
 * - Square icon-only mode with accessibility enforcement
 * - Link mode (href) rendering standard <a> anchor
 */
export const Button = createLiminalComponent<ButtonProps>(
  {
    displayName: 'Button',
    defaultElement: 'button',
    defaultProps: {
      asChild: false,
      variant: 'secondary',
      size: 'md',
      disabled: false,
      type: 'button',
      loading: false,
      iconOnly: false,
    },
  },
  (props) => {
    const {
      asChild = false,
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
      loading = false,
      iconOnly = false,
      ariaLabel,
      href,
      target,
      rel,
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

    // Reduced motion awareness
    const reduced = useReducedMotion();

    // Loading + disabled rule: disabled takes priority, loading is ignored
    const isLoading = loading && !disabled;

    const isIconOnly = iconOnly || size === 'icon';

    // Accessibility check for icon-only
    const effectiveAriaLabel = ariaLabel || (restProps as any)['aria-label'];
    if (isIconOnly && !effectiveAriaLabel) {
      console.warn('[LIMINAL Button] ariaLabel is required when iconOnly is true');
    }
    const resolvedAriaLabel = effectiveAriaLabel || (isIconOnly ? 'button' : undefined);

    // 1. Interaction DNA Hook
    const { currentState, isKeyboardFocused, handlers, ariaProps } = useLiminalInteraction<HTMLElement>({
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
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[1].fs}px`,
        minHeight: '32px',
        lineHeight: 1.4,
      },
      md: {
        padding: '10px 18px',
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[2].fs}px`,
        minHeight: '44px', // mobile touch target compliant
        lineHeight: 1.5,
      },
      lg: {
        padding: `${LiminalLayoutEngine.SPACING[3]}px ${LiminalLayoutEngine.SPACING[5]}px`,
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[3].fs}px`,
        minHeight: '52px',
        lineHeight: 1.5,
      },
      icon: {
        padding: 0,
        fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[2].fs}px`,
        minHeight: '44px',
        lineHeight: 1,
      },
    };

    const iconOnlyDimensions: Record<ButtonSize, number> = {
      sm: 32,
      md: 44,
      lg: 52,
      icon: 44,
    };

    // Icon size mappings
    const loadingIconSizes: Record<ButtonSize, IconSize> = {
      sm: 'xs', // 12px
      md: 'sm', // 16px
      lg: 'md', // 20px
      icon: 'sm',
    };

    const iconOnlyIconSizes: Record<ButtonSize, IconSize> = {
      sm: 'sm', // 16px
      md: 'md', // 20px
      lg: 'lg', // 24px
      icon: 'md',
    };

    // 3. Variant Base Resolution via buttonVariants
    const variantBase = buttonVariants({ variant, size });

    // 4. Dynamic Interactive Surface Resolution
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
    } else if (variant === 'outline') {
      let outlineBg = 'transparent';
      let outlineBorder = `1px solid ${LiminalColorEngine.getLadderColor(3)}`;
      if (currentState === 'hover') {
        outlineBg = 'rgba(255, 255, 255, 0.03)';
        outlineBorder = `1px solid ${LiminalColorEngine.getLadderColor(4)}`;
      } else if (currentState === 'active') {
        outlineBg = 'rgba(255, 255, 255, 0.06)';
        outlineBorder = `1px solid ${LiminalColorEngine.getLadderColor(5)}`;
      }

      const focusRing = LiminalComponentEngine.getFocusRing(currentState === 'focus' && isKeyboardFocused);

      computedStyle = {
        background: outlineBg,
        border: outlineBorder,
        ...focusRing,
        color: getTextStyle('primary', 2).color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: currentState === 'active' ? 'translateY(0.5px)' : 'none',
      };
    } else if (variant === 'link') {
      const focusRing = LiminalComponentEngine.getFocusRing(currentState === 'focus' && isKeyboardFocused);

      computedStyle = {
        background: 'transparent',
        border: 'none',
        ...focusRing,
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        color: currentState === 'hover'
          ? getTextStyle('primary', 1).color
          : getTextStyle('primary', 2).color,
        cursor: disabled ? 'not-allowed' : 'pointer',
      };
    }

    // 5. Composite Final Style
    const finalStyle: CSSProperties = {
      ...variantBase,
      ...computedStyle,
      display: fullWidth ? 'flex' : (isIconOnly ? 'inline-flex' : variantBase.display),
      width: isIconOnly
        ? `${iconOnlyDimensions[size]}px`
        : fullWidth
        ? '100%'
        : 'auto',
      height: isIconOnly ? `${iconOnlyDimensions[size]}px` : undefined,
      minWidth: isIconOnly ? `${iconOnlyDimensions[size]}px` : undefined,
      minHeight: isIconOnly ? `${iconOnlyDimensions[size]}px` : (variantBase.minHeight || sizeStyles[size].minHeight),
      alignItems: 'center',
      justifyContent: 'center',
      gap: `${LiminalLayoutEngine.SPACING[2]}px`,
      transition: isLoading
        ? LiminalMotionEngine.getTransition('opacity', 'fast')
        : LiminalMotionEngine.TRANSITION.normal,
      padding: isIconOnly ? 0 : (variantBase.padding || sizeStyles[size].padding),
      ...customStyle,
    };

    // Loading overrides
    if (isLoading) {
      finalStyle.opacity = 0.85;
      finalStyle.pointerEvents = 'none';
      finalStyle.cursor = 'default';
    }

    // Disabled link override
    if (disabled && href) {
      finalStyle.pointerEvents = 'none';
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (disabled || isLoading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Shared content render
    const renderContent = () => {
      if (isIconOnly) {
        if (isLoading) {
          return (
            <span
              style={{
                display: 'inline-flex',
                animation: reduced ? 'none' : 'liminal-spin 1.6s linear infinite',
              }}
            >
              <LiminalIcon
                icon={SpinnerGap}
                size={iconOnlyIconSizes[size]}
                weight="light"
              />
            </span>
          );
        }
        return icon || children;
      }

      return (
        <>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${LiminalLayoutEngine.SPACING[2]}px`,
              visibility: isLoading ? 'hidden' : 'visible',
              width: fullWidth ? '100%' : 'auto',
            }}
          >
            {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="inline-flex items-center shrink-0">{iconRight}</span>}
          </span>

          {isLoading && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  animation: reduced ? 'none' : 'liminal-spin 1.6s linear infinite',
                }}
              >
                <LiminalIcon
                  icon={SpinnerGap}
                  size={loadingIconSizes[size]}
                  weight="light"
                />
              </span>
            </span>
          )}
        </>
      );
    };

    // In asChild mode, render slot child with injected spinner/icons when needed
    const renderSlotChild = (child: ReactNode): ReactNode => {
      if (!React.isValidElement(child)) return child;
      const childElement = child as React.ReactElement<any>;
      const childProps = childElement.props;

      if (isIconOnly) {
        if (isLoading) {
          return React.cloneElement(childElement, {
            children: (
              <span
                style={{
                  display: 'inline-flex',
                  animation: reduced ? 'none' : 'liminal-spin 1.6s linear infinite',
                }}
              >
                <LiminalIcon
                  icon={SpinnerGap}
                  size={iconOnlyIconSizes[size]}
                  weight="light"
                />
              </span>
            ),
          });
        }
        return child;
      }

      const hasExtraContent = icon || iconRight || isLoading;
      if (!hasExtraContent) {
        return child;
      }

      return React.cloneElement(childElement, {
        children: (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${LiminalLayoutEngine.SPACING[2]}px`,
                visibility: isLoading ? 'hidden' : 'visible',
                width: fullWidth ? '100%' : 'auto',
              }}
            >
              {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
              {childProps.children}
              {iconRight && <span className="inline-flex items-center shrink-0">{iconRight}</span>}
            </span>

            {isLoading && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    animation: reduced ? 'none' : 'liminal-spin 1.6s linear infinite',
                  }}
                >
                  <LiminalIcon
                    icon={SpinnerGap}
                    size={loadingIconSizes[size]}
                    weight="light"
                  />
                </span>
              </span>
            )}
          </>
        ),
      });
    };

    const Comp = asChild ? Slot : (href ? 'a' : 'button');

    if (asChild) {
      const effectiveRel = href ? (rel || (target === '_blank' ? 'noopener noreferrer' : undefined)) : undefined;
      return (
        <Slot
          ref={ref as any}
          className={className}
          style={finalStyle}
          aria-busy={isLoading ? 'true' : undefined}
          aria-disabled={disabled ? 'true' : undefined}
          aria-label={resolvedAriaLabel}
          onClick={handleClick}
          href={disabled || isLoading ? undefined : (href || undefined)}
          target={target}
          rel={effectiveRel}
          {...(handlers as any)}
          {...ariaProps}
          {...(restProps as any)}
        >
          {renderSlotChild(children)}
        </Slot>
      );
    }

    if (href) {
      const effectiveRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);
      return (
        <a
          ref={ref as any}
          href={disabled || isLoading ? undefined : href}
          target={target}
          rel={effectiveRel}
          aria-busy={isLoading ? 'true' : undefined}
          aria-disabled={disabled ? 'true' : undefined}
          aria-label={resolvedAriaLabel}
          tabIndex={disabled ? -1 : undefined}
          onClick={handleClick}
          className={className}
          style={finalStyle}
          {...(handlers as any)}
          {...ariaProps}
          {...(restProps as any)}
        >
          {renderContent()}
        </a>
      );
    }

    return (
      <button
        ref={ref as any}
        type={type}
        disabled={disabled}
        aria-busy={isLoading ? 'true' : undefined}
        aria-label={resolvedAriaLabel}
        onClick={handleClick}
        className={className}
        style={finalStyle}
        {...handlers}
        {...ariaProps}
        {...restProps}
      >
        {renderContent()}
      </button>
    );
  }
);

export default Button;

