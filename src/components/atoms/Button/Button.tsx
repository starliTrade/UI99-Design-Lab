import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLiminalStyle, getLadderColor, getTextStyle, LiminalState } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
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

    let bg = brand.hex;
    if (currentState === 'hover') {
      bg = '#F5F7FA'; // L +0.05
    } else if (currentState === 'active') {
      bg = '#DDE1E8'; // L -0.05
    }

    computedStyle = {
      background: bg,
      color: brand.onColor,
      border: 'none',
      outline: stateStyle.outline,
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

    computedStyle = {
      ...limStyle.style,
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

    computedStyle = {
      ...limStyle.style,
      background: ghostBg,
      border: 'none',
      color: getTextStyle('primary', 2).color,
    };
  } else if (variant === 'danger') {
    const limStyle = getLiminalStyle({
      surfaceLevel: 2,
      interactive: true,
      state: currentState,
    });

    const dangerText = LiminalColorEngine.SEMANTICS.DANGER.text;

    computedStyle = {
      ...limStyle.style,
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

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setInternalState('hover')}
      onMouseLeave={() => !disabled && setInternalState('idle')}
      onMouseDown={() => !disabled && setInternalState('active')}
      onMouseUp={() => !disabled && setInternalState('hover')}
      onFocus={() => !disabled && setInternalState('focus')}
      onBlur={() => !disabled && setInternalState('idle')}
      className={className}
      style={finalStyle}
    >
      {children}
    </button>
  );
}

export default Button;
