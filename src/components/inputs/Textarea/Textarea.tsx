import React, { useState } from 'react';
import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getTextStyle,
  LADDER,
  LiminalState,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  error?: string;
  success?: string;
  helperText?: string;
  rows?: number;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export function Textarea({
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
  rows = 4,
  name,
  id,
  className = '',
  style: customStyle = {},
}: TextareaProps) {
  const [internalState, setInternalState] = useState<LiminalState>('idle');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const currentState: LiminalState = disabled ? 'disabled' : internalState;

  // Resolve base interactive style from engine
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

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: '100px',
    padding: '12px 14px',
    borderRadius: `${RADIUS.control}px`, // 10px
    boxSizing: 'border-box',
    transition: LiminalMotionEngine.TRANSITION.slow,
    background,
    border,
    ...focusRing,
    opacity: limStyle.style.opacity,
    cursor: disabled ? 'not-allowed' : 'text',
    color: getTextStyle('primary', 2).color,
    fontSize: `${TYPOGRAPHY[3].fs}px`, // 16px
    fontFamily: 'inherit',
    lineHeight: 1.6,
    resize: 'vertical',
  };

  const labelStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    letterSpacing: TYPOGRAPHY[2].ls, // +0.01em
    fontWeight: TYPOGRAPHY[2].weight, // 500
    color: getTextStyle('tertiary', 2).color,
    userSelect: 'none',
    marginBottom: `${SPACING[2]}px`, // 8px
  };

  const helperStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
    letterSpacing: TYPOGRAPHY[1].ls, // +0.04em
    marginTop: `${SPACING[1]}px`, // 4px
    color: error
      ? SEMANTICS.DANGER.text
      : success
      ? SEMANTICS.SUCCESS.text
      : getTextStyle('quaternary', 2).color,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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

      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsKeyboardFocused(false)}
        onMouseEnter={() => !disabled && internalState !== 'focus' && setInternalState('hover')}
        onMouseLeave={() => !disabled && internalState !== 'focus' && setInternalState('idle')}
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
        style={textareaStyle}
      />

      {(error || success || helperText) && (
        <span style={helperStyle}>{error || success || helperText}</span>
      )}
    </div>
  );
}

export default Textarea;
