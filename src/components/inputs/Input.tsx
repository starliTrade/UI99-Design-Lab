import React, { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const INPUT_SIZES = {
  sm: { height: '32px', fontSize: '11px', padding: '0 10px' },
  md: { height: '42px', fontSize: '13px', padding: '0 14px' },
  lg: { height: '50px', fontSize: '15px', padding: '0 16px' },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    size = 'md',
    fullWidth = true,
    disabled = false,
    className = '',
    style: userStyle,
    onFocus,
    onBlur,
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  const isError = Boolean(errorMessage);
  const state = disabled ? 'disabled' : isFocused ? 'focus' : 'idle';

  const liminal = getLiminalStyle({
    surfaceLevel: 2,
    containerLevel: 1,
    interactive: true,
    isInput: true,
    state,
  });

  const sizeConfig = INPUT_SIZES[size];

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}>
      {label && (
        <label
          className="font-mono text-[11px] uppercase tracking-wider select-none"
          style={getTextStyle('tertiary', 1)}
        >
          {label}
        </label>
      )}

      <div
        className="relative flex items-center transition-all"
        style={{
          ...liminal.style,
          borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
          ...(isError
            ? {
                outline: `1px solid ${LiminalColorEngine.SEMANTICS.DANGER.border}`,
                outlineOffset: '2px',
              }
            : {}),
        }}
      >
        {leftIcon && (
          <span
            className="pl-3 pr-1 inline-flex items-center justify-center shrink-0"
            style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className="w-full bg-transparent font-mono outline-none placeholder:text-white/25 disabled:cursor-not-allowed"
          style={{
            height: sizeConfig.height,
            fontSize: sizeConfig.fontSize,
            padding: leftIcon || rightIcon ? '0 8px' : sizeConfig.padding,
            color: SpecEngine.getTextStyle('primary', 2).color,
            ...userStyle,
          }}
          {...props}
        />

        {rightIcon && (
          <span
            className="pr-3 pl-1 inline-flex items-center justify-center shrink-0"
            style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {(errorMessage || helperText) && (
        <span
          className="font-mono text-[10px] leading-tight"
          style={
            errorMessage
              ? { color: LiminalColorEngine.SEMANTICS.DANGER.text }
              : getTextStyle('quaternary', 1)
          }
        >
          {errorMessage || helperText}
        </span>
      )}
    </div>
  );
});
