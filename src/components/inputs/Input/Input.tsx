import React, { useState, useEffect, useRef, useId } from 'react';
import type { CSSProperties, ReactNode, ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import { Eye, EyeSlash, X } from '@phosphor-icons/react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getTextStyle,
  LiminalState,
} from '../../../engine/spec-engine';
import { resolveSurface, resolveBorder } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';

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
  togglePassword?: boolean;
  maxLength?: number;
  showCount?: boolean;
  clearable?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  name?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  role?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  ariaControls?: string;
  ariaActiveDescendant?: string;
  ariaAutocomplete?: 'none' | 'inline' | 'list' | 'both';
  className?: string;
  style?: CSSProperties;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
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
    togglePassword = false,
    maxLength,
    showCount = false,
    clearable = false,
    allowClear = false,
    onClear,
    name,
    id,
    required = false,
    autoComplete,
    readOnly,
    autoFocus,
    onKeyDown,
    role,
    ariaExpanded,
    ariaHasPopup,
    ariaControls,
    ariaActiveDescendant,
    ariaAutocomplete,
    className = '',
    style: customStyle = {},
  }: InputProps,
  forwardedRef
) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [internalVal, setInternalVal] = useState<string>(value ?? defaultValue ?? '');

  const localInputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  // Combine ref
  const setInputRef = (element: HTMLInputElement | null) => {
    (localInputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
  };

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value);
    }
  }, [value]);

  const effectiveValue = value !== undefined ? value : internalVal;
  const currentLength = effectiveValue.length;

  // Validate togglePassword usage: if type !== 'password' and togglePassword=true, warn and ignore
  const isPasswordType = type === 'password';
  const shouldEnableToggle = isPasswordType && togglePassword;

  useEffect(() => {
    if (togglePassword && !isPasswordType) {
      console.warn(
        `[Liminal Input] togglePassword prop is only supported when type="password". Received type="${type}". The toggle is ignored.`
      );
    }
  }, [togglePassword, isPasswordType, type]);

  const effectiveType = shouldEnableToggle ? (showPassword ? 'text' : 'password') : type;

  const SPACING = LiminalLayoutEngine.SPACING;

  const CONTROL = LiminalLayoutEngine.CONTROL;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const surfaceLevel = 2;

  const rawLeft = prefix ?? leftIcon;
  const rawRight = suffix ?? rightIcon;

  const isClearable = (clearable || allowClear) && !disabled && currentLength > 0;


  // The interaction states are CSS's job now (:hover, :focus-within). Only the
  // validation states stay in JavaScript, because they depend on props rather
  // than on what the pointer or the keyboard is doing.
  const host = useHostSurface();
  const idleSurface = resolveSurface({ role: 'control', on: host }).background;
  const hoverSurface = resolveSurface({ role: 'control', state: 'hover', on: host }).background;
  const focusSurface = resolveSurface({ role: 'control', state: 'focus', on: host }).background;

  const ringColor = error
    ? SEMANTICS.DANGER.solid
    : success
    ? SEMANTICS.SUCCESS.solid
    : LiminalColorEngine.BRAND_PRIMARY.hex;

  let background = idleSurface;
  let border = `1px solid ${resolveBorder({ role: 'control', kind: 'edge', on: host })}`;

  if (!disabled) {
    if (error) {
      border = `1px solid ${SEMANTICS.DANGER.border}`;
      const baseRim = getDirectionalRim(surfaceLevel, surfaceLevel, false);
      if (baseRim) {
        background = `linear-gradient(rgba(229, 99, 122, 0.08), rgba(229, 99, 122, 0.08)), ${baseRim.cssBackground}`;
      }
    } else if (success) {
      border = `1px solid ${SEMANTICS.SUCCESS.border}`;
      const baseRim = getDirectionalRim(surfaceLevel, surfaceLevel, false);
      if (baseRim) {
        background = `linear-gradient(rgba(52, 192, 139, 0.08), rgba(52, 192, 139, 0.08)), ${baseRim.cssBackground}`;
      }
    }
  }

  // WS-2 Container style: flex, items-center, gap 8px (SPACING[2]), padding 12px (SPACING[3]), disabled opacity 0.5
  const fieldWrapperStyle = {
    '--liminal-surface-idle': background,
    '--liminal-surface-hover': disabled || error || success ? background : hoverSurface,
    '--liminal-surface-focus': disabled || error || success ? background : focusSurface,
    '--liminal-border-focus': ringColor,
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    padding: `${SPACING[3]}px`, // 12px
    minHeight: CONTROL.md,
    borderRadius: `${RADIUS.control}px`, // 10px
    boxSizing: 'border-box',
    width: '100%',
    transition: LiminalMotionEngine.TRANSITION.slow,
    background,
    border,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  } as CSSProperties;

  // WS-2 Inner input element style: flex: 1, border: none, background: transparent, padding: 0
  const inputElementStyle: CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: getTextStyle('primary', surfaceLevel).color,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(3), // 16px
    lineHeight: TYPOGRAPHY[3].lh,
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const labelStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    letterSpacing: TYPOGRAPHY[2].ls,
    fontWeight: 500,
    color: getTextStyle('secondary', surfaceLevel).color,
    marginBottom: `${SPACING[1]}px`, // 4px
    userSelect: 'none',
  };

  const helperStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(1), // 11px
    lineHeight: TYPOGRAPHY[1].lh,
    letterSpacing: TYPOGRAPHY[1].ls,
    color: error
      ? SEMANTICS.DANGER.text
      : success
      ? SEMANTICS.SUCCESS.text
      : getTextStyle('tertiary', surfaceLevel).color,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalVal(e.target.value);
    }
    onChange?.(e);
  };

  // Toggle Password Action (WS-1)
  //
  // The layer owns `color` for these icons — see data-liminal-hover-color on
  // the button. Setting it here would cancel the hover rule, which is what had
  // happened in every other user of the pattern. The target is `primary`:
  // `secondary` derives to the same alpha as `tertiary` (both 0.790), so a
  // secondary hover would not have changed anything even once the rule worked.
  const toggleIconIdle = getTextStyle('tertiary', surfaceLevel).color;
  const toggleIconHover = getTextStyle('primary', surfaceLevel).color;

  const toggleButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    '--liminal-color-idle': toggleIconIdle,
    '--liminal-hover-color': toggleIconHover,
    flexShrink: 0,
    transition: reducedMotion
      ? 'none'
      : LiminalMotionEngine.getTransition('color', 'fast'),
  } as CSSProperties;

  const handleToggleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setShowPassword((prev) => !prev);
    }
  };

  const passwordToggleElement = shouldEnableToggle ? (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Toggle password visibility"
      disabled={disabled}
      onClick={handleToggleClick}
      data-liminal-hover-color=""
      style={toggleButtonStyle}
    >
      <LiminalIcon
        icon={showPassword ? EyeSlash : Eye}
        size="sm"
        weight="light"
      />
    </button>
  ) : null;

  // Clear Action (WS-4) — same treatment as the toggle above.
  const clearIconIdle = getTextStyle('tertiary', surfaceLevel).color;
  const clearIconHover = getTextStyle('primary', surfaceLevel).color;

  const clearButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    '--liminal-color-idle': clearIconIdle,
    '--liminal-hover-color': clearIconHover,
    flexShrink: 0,
    transition: reducedMotion
      ? 'none'
      : LiminalMotionEngine.getTransition('color', 'fast'),
  } as CSSProperties;

  const handleClearClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (value === undefined) {
      setInternalVal('');
    }

    if (localInputRef.current) {
      localInputRef.current.value = '';
      const syntheticEvent = {
        ...e,
        target: localInputRef.current,
        currentTarget: localInputRef.current,
      } as unknown as ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
      localInputRef.current.focus();
    }
    onClear?.();
  };

  const clearButtonElement = isClearable ? (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Clear input"
      disabled={disabled}
      onClick={handleClearClick}
      data-liminal-hover-color=""
      style={clearButtonStyle}
    >
      <LiminalIcon
        icon={X}
        size="sm"
        weight="light"
      />
    </button>
  ) : null;

  // Render Adornments (WS-2: Icon vs Text)
  const renderAdornment = (node: ReactNode) => {
    if (node === null || node === undefined || node === false) return null;

    const tertiaryColor = getTextStyle('tertiary', surfaceLevel).color;

    // Text prefix/suffix: 13px (TYPOGRAPHY[2].fs), color tertiary
    if (typeof node === 'string' || typeof node === 'number') {
      return (
        <span
          style={{
            fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
            lineHeight: TYPOGRAPHY[2].lh,
            color: tertiaryColor,
            userSelect: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {node}
        </span>
      );
    }

    // Phosphor icon component passed directly as a type/function
    if (typeof node === 'function') {
      const IconComponent = node as any;
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tertiaryColor,
            flexShrink: 0,
          }}
        >
          <LiminalIcon icon={IconComponent} size="sm" weight="light" />
        </span>
      );
    }

    // ReactNode / JSX element
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tertiaryColor,
          flexShrink: 0,
        }}
      >
        {node}
      </span>
    );
  };

  // WS-3: Character Count calculations
  const shouldRenderCount = showCount && maxLength !== undefined;
  const isCountWarning = maxLength !== undefined && currentLength > maxLength * 0.9;
  const isCountDanger = maxLength !== undefined && currentLength >= maxLength;
  const countColor = isCountDanger
    ? SEMANTICS.DANGER.text
    : isCountWarning
    ? SEMANTICS.WARNING.text
    : getTextStyle('tertiary', surfaceLevel).color;

  // A visible label must be programmatically associated with its control.
  // Without a generated id, `htmlFor` is undefined and screen readers announce
  // the field with no name (axe rule "label", impact: critical).
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const helperId = error || success || helperText ? `${fieldId}-helper` : undefined;
  const countId = shouldRenderCount ? `${fieldId}-count` : undefined;
  const ariaDescribedBy = [helperId, countId].filter(Boolean).join(' ') || undefined;

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
        <label htmlFor={fieldId} style={labelStyle}>
          {label}
        </label>
      )}

      <div
        data-liminal-focus-within=""
        data-liminal-disabled={disabled ? "" : undefined}
        style={fieldWrapperStyle}
      >
        {renderAdornment(rawLeft)}

        <input
          ref={setInputRef}
          type={effectiveType}
          id={fieldId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoFocus={autoFocus}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-describedby={ariaDescribedBy}
          role={role}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHasPopup}
          aria-controls={ariaControls}
          aria-activedescendant={ariaActiveDescendant}
          aria-autocomplete={ariaAutocomplete}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          style={inputElementStyle}
        />

        {renderAdornment(rawRight)}
        {clearButtonElement}
        {passwordToggleElement}
      </div>

      {((error || success || helperText) || shouldRenderCount) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: (error || success || helperText) ? 'space-between' : 'flex-end',
            width: '100%',
            marginTop: `${SPACING[1]}px`, // 4px
            gap: `${SPACING[2]}px`,
          }}
        >
          {(error || success || helperText) ? (
            <span id={helperId} style={helperStyle}>
              {error || success || helperText}
            </span>
          ) : (
            <span />
          )}

          {shouldRenderCount && (
            <div
              id={countId}
              style={{
                fontSize: LiminalLayoutEngine.getTypeSizeCss(1), // 11px
                lineHeight: TYPOGRAPHY[1].lh,
                letterSpacing: TYPOGRAPHY[1].ls,
                color: countColor,
                fontFamily: 'monospace',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default Input;
