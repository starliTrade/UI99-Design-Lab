import React, { useState, useEffect, useRef, useId } from 'react';
import type { CSSProperties, ReactNode, ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import { Eye, EyeSlash, X } from '@phosphor-icons/react';
import {
  getTextStyle,
  LiminalState,
} from '../../../engine/spec-engine';
import { resolveSurface, resolveBorder, resolveInteractionVars, ROLE_LEVEL } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';

/**
 * The standard `<input>` attributes are accepted, not enumerated.
 *
 * They were enumerated — every prop listed and passed explicitly — and `...rest`
 * was never spread. So `aria-invalid`, `aria-required`, `data-*` and every other
 * attribute a consumer passes was silently dropped. A form that wires its errors
 * through `aria-invalid` could not: the attribute never reached the element.
 */
type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'prefix'
>;

export interface InputProps extends NativeInputProps {
  /**
   * The control height. `md` is the default AND the accessible minimum — the
   * engine's `CONTROL.md` and `TARGET.min` are the same number, so the default
   * is not a compromise.
   *
   * It was missing: `minHeight` was hardcoded to `CONTROL.md`, so every input
   * was 44px and there was no way to ask for a denser one.
   */
  size?: 'sm' | 'md' | 'lg';
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
    size = 'md',
    className = '',
    style: customStyle = {},
    ...rest
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

  const L = LiminalLayoutEngine;

  const CONTROL_PADDING = LiminalLayoutEngine.CONTROL_PADDING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  // The text sits on the surface that HOSTS the field, not on the field.
  // `surfaceLevel` below is a hand-picked pair for the validation tint's
  // rim and is recorded for gap 8 (21 hand-picked numbers).
  const surfaceLevel = 2;

  const rawLeft = prefix ?? leftIcon;
  const rawRight = suffix ?? rightIcon;

  const isClearable = (clearable || allowClear) && !disabled && currentLength > 0;


  // The interaction states are CSS's job now (:hover, :focus-within). Only the
  // validation states stay in JavaScript, because they depend on props rather
  // than on what the pointer or the keyboard is doing.
  const host = useHostSurface();
  const idleSurface = resolveSurface({ role: 'control', on: host }).background;

  const ringColor = error
    ? SEMANTICS.DANGER.solid
    : success
    ? SEMANTICS.SUCCESS.solid
    : LiminalColorEngine.BRAND_PRIMARY.hex;

  let background = idleSurface;
  const borderColor = resolveBorder({ role: 'control', kind: 'edge', on: host });

  if (!disabled) {
    if (error) {
      const baseRim = resolveSurface({ role: 'control', on: host }).rimColors;
      if (baseRim) {
        // The engine's own subtle tint, not a colour invented here. Two of these
        // were hand-picked (#e5637a and #34c08b) and copied into four
        // components — colours that exist nowhere in the engine.
        background = `linear-gradient(${LiminalColorEngine.SEMANTICS.DANGER.subtle}, ${LiminalColorEngine.SEMANTICS.DANGER.subtle}), ${baseRim.cssBackground}`;
      }
    } else if (success) {
      const baseRim = resolveSurface({ role: 'control', on: host }).rimColors;
      if (baseRim) {
        background = `linear-gradient(${LiminalColorEngine.SEMANTICS.SUCCESS.subtle}, ${LiminalColorEngine.SEMANTICS.SUCCESS.subtle}), ${baseRim.cssBackground}`;
      }
    }
  }

  // WS-2 Container style: flex, items-center, gap 8px (SPACING[2]), padding 12px (SPACING[3]), disabled opacity 0.5
  const fieldWrapperStyle = {
    // The layer owns the surface AND the border colour — see
    // data-liminal-surface / data-liminal-focus-within.
    //
    // An invalid or successful field keeps its own fill in EVERY state: the
    // tint is the message, and a hover that washed it out would erase it.
    // `frozen` also gives the pressed state a value; it had none, so pressing a
    // field fell through to `transparent`.
    ...resolveInteractionVars({
      role: 'control',
      on: host,
      idle: background,
      frozen: disabled || error || success ? background : undefined,
      border: borderColor,
      borderFocus: ringColor,
    }),
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    // The vertical padding is DERIVED from the control height, not fixed.
    //
    // It was a fixed value, and a fixed value cannot be right: the padding plus
    // the content must equal the declared height, and the content differs
    // between a Button and an Input. Measured: `CONTROL.md` says 44 and the
    // input rendered at 48, because 26 (line box) + 2x10 (padding) + 2 (border)
    // is 48 and `minHeight` is only a floor.
    //
    // `1lh` is the element's own line box, so the control is EXACTLY its
    // declared height — and it stays exact when the fluid type changes the line
    // box, because the padding absorbs the difference.
    paddingBlock: `calc((${CONTROL[size]}px - 1lh - ${2 * L.BORDER.hairline}px) / 2)`,
    paddingInline: `${SPACING[3]}px`,
    minHeight: CONTROL[size],
    borderRadius: `${RADIUS.control}px`, // 10px
    boxSizing: 'border-box',
    width: '100%',
    transition: LiminalMotionEngine.TRANSITION.slow,
    // NO `background`. The layer owns it — see data-liminal-surface.
    // An inline background beats the CSS rule, so this line cancelled the
    // hover the component had just opted into. Fifth time this session.
    // Only the width and style. `borderColor` belongs to the layer, which
    // changes it on focus — an inline shorthand would cancel that too.
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  } as CSSProperties;

  // WS-2 Inner input element style: flex: 1, border: none, background: transparent, padding: 0
  const inputElementStyle: CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: getTextStyle('primary', ROLE_LEVEL[host]).color,
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
    color: getTextStyle('secondary', ROLE_LEVEL[host]).color,
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
      : getTextStyle('tertiary', ROLE_LEVEL[host]).color,
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
  const toggleIconIdle = getTextStyle('tertiary', ROLE_LEVEL[host]).color;
  const toggleIconHover = getTextStyle('primary', ROLE_LEVEL[host]).color;

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
  const clearIconIdle = getTextStyle('tertiary', ROLE_LEVEL[host]).color;
  const clearIconHover = getTextStyle('primary', ROLE_LEVEL[host]).color;

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

    const tertiaryColor = getTextStyle('tertiary', ROLE_LEVEL[host]).color;

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
    : getTextStyle('tertiary', ROLE_LEVEL[host]).color;

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
        data-liminal-disabled={disabled ? "" : undefined}
        // The wrapper publishes all six variables through the producer.
        // `data-liminal-surface` gives hover and the idle fill;
        // `data-liminal-focus-within` gives focus.
        data-liminal-surface=""
        data-liminal-focus-within=""
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
          aria-describedby={ariaDescribedBy ?? (rest['aria-describedby'] as string | undefined)}
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
          {...rest}
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
