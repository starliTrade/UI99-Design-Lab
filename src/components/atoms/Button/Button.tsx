import React, { useState } from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import { getLiminalStyle, getLadderColor, getTextStyle, LiminalState } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  type = 'button',
  className = '',
  style: customStyle = {},
}: ButtonProps) {
  const [internalState, setInternalState] = useState<LiminalState>('idle');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const currentState: LiminalState = disabled ? 'disabled' : internalState;

  // 1. Size token resolution from LiminalLayoutEngine
  const sizeStyles: Record<'sm' | 'md' | 'lg', CSSProperties> = {
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

  // 2. Variant & State Resolution
  let computedStyle: CSSProperties = {};

  if (variant === 'primary') {
    const brand = LiminalColorEngine.BRAND_PRIMARY;
    const stateStyle = LiminalColorEngine.getStateStyle({
      baseL: 0.90,
      baseColor: brand.hex,
      state: currentState,
    });

    // L +0.05 (#F5F7FA) and L -0.05 (#DDE1E8) from BRAND_PRIMARY (#E9ECF2) per state formula
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
    const limStyle = getLiminalStyle({
      surfaceLevel: 2,
      interactive: true,
      state: currentState,
    });

    const outline = currentState === 'focus' && isKeyboardFocused ? limStyle.style.outline : 'none';

    computedStyle = {
      ...limStyle.style,
      outline,
      color: getTextStyle('primary', 2).color,
    };
  } else if (variant === 'ghost') {
    const limStyle = getLiminalStyle({
      surfaceLevel: 2,
      interactive: true,
      state: currentState,
    });

    let ghostBg = 'transparent';
    if (currentState === 'hover') {
      ghostBg = getLadderColor(2.5); // +0.5Δ
    } else if (currentState === 'active') {
      ghostBg = getLadderColor(1.5); // -0.5Δ
    }

    const outline = currentState === 'focus' && isKeyboardFocused ? limStyle.style.outline : 'none';

    computedStyle = {
      ...limStyle.style,
      background: ghostBg,
      border: 'none',
      outline,
      color: getTextStyle('primary', 2).color,
    };
  } else if (variant === 'danger') {
    const limStyle = getLiminalStyle({
      surfaceLevel: 2,
      interactive: true,
      state: currentState,
    });

    const dangerText = LiminalColorEngine.SEMANTICS.DANGER.text;
    const outline = currentState === 'focus' && isKeyboardFocused ? limStyle.style.outline : 'none';

    computedStyle = {
      ...limStyle.style,
      outline,
      color: dangerText,
    };
  }

  const finalStyle: CSSProperties = {
    fontFamily: 'inherit',
    fontWeight: baseFontWeight,
    borderRadius: `${controlRadius}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${LiminalLayoutEngine.SPACING[2]}px`, // 8px
    transition: 'all 0.2s ease',
    userSelect: 'none',
    boxSizing: 'border-box',
    textDecoration: 'none',
    ...sizeStyles[size],
    ...computedStyle,
    ...customStyle,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => {
        setIsKeyboardFocused(false);
        if (!disabled) setInternalState('active');
      }}
      onMouseUp={() => !disabled && setInternalState('hover')}
      onMouseEnter={() => !disabled && setInternalState('hover')}
      onMouseLeave={() => !disabled && setInternalState('idle')}
      onFocus={() => !disabled && setInternalState('focus')}
      onBlur={() => {
        setInternalState('idle');
        setIsKeyboardFocused(false);
      }}
      className={className}
      style={finalStyle}
    >
      {children}
    </button>
  );
}

export default Button;
