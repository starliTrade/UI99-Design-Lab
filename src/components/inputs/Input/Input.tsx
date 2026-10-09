import React, { useState } from 'react';
import type { CSSProperties, ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  LADDER,
  LiminalState,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  success?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  name?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  style?: CSSProperties;
}

export function Input({
  type = 'text',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  success,
  helperText,
  prefix,
  suffix,
  leftIcon,
  rightIcon,
  name,
  id,
  required = false,
  autoComplete,
  className = '',
  style: customStyle = {},
}: InputProps) {
  const [internalState, setInternalState] = useState<LiminalState>('idle');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const leftElement = prefix ?? leftIcon;
  const rightElement = suffix ?? rightIcon;

  const currentState: LiminalState = disabled ? 'disabled' : internalState;

  // Resolve base interactive input style from engine
  const limStyle = getLiminalStyle({
    surfaceLevel: 2,
    interactive: true,
    isInput: true,
    state: currentState,
  });

  // Focus ring via engine
  const ringColor = error
    ? SEMANTICS.DANGER.solid
    : success
    ? SEMANTICS.SUCCESS.solid
    : LiminalColorEngine.BRAND_PRIMARY.hex;
  const focusRing = LiminalComponentEngine.getFocusRing(
    currentState === 'focus' && isKeyboardFocused,
    ringColor
  );

  // Background and border resolution based on error/success/states
  let background = limStyle.style.background;
  let border = limStyle.style.border;

  if (!disabled) {
    if (error) {
      border = `1px solid ${SEMANTICS.DANGER.border}`;
      const baseRim = getDirectionalRim(2, 2, false);
      if (baseRim) {
        background = `linear-gradient(rgba(229, 99, 122, 0.08), rgba(229, 99, 122, 0.08)), ${baseRim.cssBackground}`;
      }
    } else if (success) {
      border = `1px solid ${SEMANTICS.SUCCESS.border}`;
      const baseRim = getDirectionalRim(2, 2, false);
      if (baseRim) {
        background = `linear-gradient(rgba(52, 192, 139, 0.08), rgba(52, 192, 139, 0.08)), ${baseRim.cssBackground}`;
      }
    }
  }

  const fieldWrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    minHeight: '44px', // mobile touch target compliant
    padding: '0 14px',
    borderRadius: `${RADIUS.control}px`, // 10px
    boxSizing: 'border-box',
    width: '100%',
    transition: LiminalMotionEngine.TRANSITION.slow,
    background,
    border,
    ...focusRing,
    opacity: limStyle.style.opacity,
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: limStyle.style.boxShadow,
  };

  const inputElementStyle: CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: getTextStyle('primary', 2).color,
    fontSize: `${TYPOGRAPHY[3].fs}px`, // 15px
    lineHeight: TYPOGRAPHY[3].lh,
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const labelStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    letterSpacing: TYPOGRAPHY[2].ls,
    fontWeight: 500,
    color: getTextStyle('secondary', 2).color,
    marginBottom: `${SPACING[1]}px`, // 4px
    userSelect: 'none',
  };

  const helperStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
    lineHeight: TYPOGRAPHY[1].lh,
    letterSpacing: TYPOGRAPHY[1].ls,
    marginTop: `${SPACING[1]}px`, // 4px
    color: error
      ? SEMANTICS.DANGER.text
      : success
      ? SEMANTICS.SUCCESS.text
      : getTextStyle('tertiary', 2).color,
  };

  const adornmentStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: getTextStyle('tertiary', 2).color,
    flexShrink: 0,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}

      <div
        style={fieldWrapperStyle}
        onMouseEnter={() => !disabled && internalState !== 'focus' && setInternalState('hover')}
        onMouseLeave={() => !disabled && internalState !== 'focus' && setInternalState('idle')}
        onMouseDown={() => {
          setIsKeyboardFocused(false);
        }}
      >
        {leftElement && <span style={adornmentStyle}>{leftElement}</span>}

        <input
          type={type}
          id={id}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            if (!disabled) {
              setInternalState('focus');
            }
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setInternalState('idle');
            setIsKeyboardFocused(false);
            onBlur?.(e);
          }}
          style={inputElementStyle}
        />

        {rightElement && <span style={adornmentStyle}>{rightElement}</span>}
      </div>

      {(error || success || helperText) && (
        <span style={helperStyle}>{error || success || helperText}</span>
      )}
    </div>
  );
}

export default Input;
