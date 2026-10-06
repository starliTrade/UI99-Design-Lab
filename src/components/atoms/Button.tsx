import React, { useState, type CSSProperties } from 'react';
import { getLiminalStyle, type LiminalState } from '../../engine/spec-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  forcedState?: LiminalState;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SIZE_STYLE: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '11px', minHeight: '32px', gap: '6px' },
  md: { padding: '10px 18px', fontSize: '13px', minHeight: '42px', gap: '8px' },
  lg: { padding: '12px 24px', fontSize: '15px', minHeight: '50px', gap: '10px' },
};

export function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  forcedState,
  icon,
  iconRight,
  fullWidth = false,
  children,
  onClick,
  style: userStyle,
  className = '',
  ...props
}: ButtonProps) {
  const [internalState, setInternalState] = useState<LiminalState>('idle');

  const currentState: LiminalState = disabled
    ? 'disabled'
    : (forcedState ?? internalState);

  // Primary Brand Button (Soft White #E9ECF2)
  if (variant === 'primary') {
    const brand = LiminalColorEngine.BRAND_PRIMARY.hex;
    const isHover = currentState === 'hover';
    const isActive = currentState === 'active';
    const isFocus = currentState === 'focus';

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => !disabled && !forcedState && setInternalState('hover')}
        onMouseLeave={() => !disabled && !forcedState && setInternalState('idle')}
        onFocus={() => !disabled && !forcedState && setInternalState('focus')}
        onBlur={() => !disabled && !forcedState && setInternalState('idle')}
        onMouseDown={() => !disabled && !forcedState && setInternalState('active')}
        onMouseUp={() => !disabled && !forcedState && setInternalState('hover')}
        className={`inline-flex items-center justify-center font-mono select-none font-medium transition-all ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        style={{
          ...SIZE_STYLE[size],
          background: isActive ? '#DDE1E8' : isHover ? '#F4F6FA' : brand,
          color: LiminalColorEngine.BRAND_PRIMARY.onColor,
          border: 'none',
          borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: isFocus ? `2px solid rgba(233, 236, 242, 0.45)` : 'none',
          outlineOffset: '2px',
          opacity: disabled ? 0.25 : 1,
          transform: isActive ? 'translateY(0.5px)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          ...userStyle,
        }}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
        {children && <span>{children}</span>}
        {iconRight && <span className="inline-flex shrink-0 items-center justify-center">{iconRight}</span>}
      </button>
    );
  }

  // Base level: ghost sits on Surface 0 (or transparent), secondary/danger sit on Surface 2 (controls)
  const baseN = variant === 'ghost' ? 0 : 2;

  const { style } = getLiminalStyle({
    surfaceLevel: baseN,
    interactive: true,
    state: currentState,
  });

  // Variant ghost: transparent background, rim removed (only hover gets subtle background)
  const ghostStyle: CSSProperties = variant === 'ghost'
    ? {
        background: currentState === 'hover' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
        border: 'none',
        color: disabled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.62)',
      }
    : {};

  // Variant danger: semantic danger text color
  const dangerColor: CSSProperties = variant === 'danger'
    ? {
        color: currentState === 'hover'
          ? LiminalColorEngine.SEMANTICS.DANGER.solid
          : LiminalColorEngine.SEMANTICS.DANGER.text,
      }
    : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && !forcedState && setInternalState('hover')}
      onMouseLeave={() => !disabled && !forcedState && setInternalState('idle')}
      onFocus={() => !disabled && !forcedState && setInternalState('focus')}
      onBlur={() => !disabled && !forcedState && setInternalState('idle')}
      onMouseDown={() => !disabled && !forcedState && setInternalState('active')}
      onMouseUp={() => !disabled && !forcedState && setInternalState('hover')}
      className={`inline-flex items-center justify-center font-mono select-none font-medium transition-all ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={{
        ...SIZE_STYLE[size],
        borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
        ...style,
        ...ghostStyle,
        ...dangerColor,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...userStyle,
      }}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="inline-flex shrink-0 items-center justify-center">{iconRight}</span>}
    </button>
  );
}
