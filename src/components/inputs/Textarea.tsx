import React, { useState, forwardRef, type TextareaHTMLAttributes } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    helperText,
    errorMessage,
    fullWidth = true,
    disabled = false,
    rows = 3,
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
        className="relative transition-all p-2.5"
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
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className="w-full bg-transparent font-mono text-xs outline-none resize-y placeholder:text-white/25 disabled:cursor-not-allowed leading-relaxed"
          style={{
            color: SpecEngine.getTextStyle('primary', 2).color,
            ...userStyle,
          }}
          {...props}
        />
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
