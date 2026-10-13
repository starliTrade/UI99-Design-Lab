import React, { useState, useEffect, useRef, useId } from 'react';
import { useDirection } from '../../../engine/liminal-direction';
import type { CSSProperties, ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getTextStyle,
  LiminalState, getLadderColor } from '../../../engine/spec-engine';
import { resolveSurface, resolveBorder } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
  icon?: ReactNode;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  value?: string;
  defaultValue?: string;
  /**
   * ONE signature. It used to accept either `(value: string)` or `(event)`, and
   * tried to tell them apart with `try { onChange(value) } catch { onChange(e) }`
   * — which cannot work: calling an event-style handler with a string does not
   * throw, so the catch never fired and the caller silently received a string
   * where it expected an event. Nothing used the event form, so it is gone.
   */
  onChange?: (value: string) => void;
  onFocus?: (e: FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  error?: string;
  success?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Which END of the field the caret sits at. `end` is the default. */
  caretPosition?: 'start' | 'end';
}

/**
 * Select · LIMINAL v1.0
 * WS-1 Custom Select UI
 * - Native <select> with appearance: none (removes native browser arrow chrome)
 * - Phosphor CaretDown icon with <LiminalIcon size="sm" weight="light" />
 * - In RTL: CaretDown placed on the left side
 * - Wrapped in flex container matching Input.tsx architecture (rim and focus ring around whole component)
 * - Icon color: getTextStyle('tertiary', surfaceLevel), hover: getTextStyle('secondary', surfaceLevel)
 * - Motion: LiminalMotionEngine.getTransition('color', 'fast'), disabled on reduced-motion
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    placeholder = 'Select an option...',
    options = [],
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
    name,
    id,
    required = false,
    className = '',
    style: customStyle = {},
    children,
    caretPosition,
  }: SelectProps,
  forwardedRef
) {
  const [internalValue, setInternalValue] = useState<string>(
    value ?? defaultValue ?? ''
  );

  const localSelectRef = useRef<HTMLSelectElement>(null);
  const reducedMotion = useReducedMotion();

  // Combine ref
  const setSelectRef = (element: HTMLSelectElement | null) => {
    (localSelectRef as React.MutableRefObject<HTMLSelectElement | null>).current = element;
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLSelectElement | null>).current = element;
    }
  };

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const effectiveValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === effectiveValue);

  const SPACING = LiminalLayoutEngine.SPACING;

  const CONTROL = LiminalLayoutEngine.CONTROL;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const surfaceLevel = 2;

  // The direction comes from the document, not from a prop. `DirProvider` puts
  // `dir` on the document element, so `direction` and `text-align` are inherited
  // and the caret only needs to know which END of the field it sits at.
  const dir = useDirection();
  const caretAtEnd = (caretPosition ?? 'end') === 'end';


  // The interaction states are CSS's job now (:hover, :focus-within). Only the
  // validation states stay in JavaScript — they depend on props.
  const host = useHostSurface();
  // The label associates through `htmlFor`, so an id is REQUIRED — and it was
  // optional with no default, which meant `<label htmlFor={undefined}>` and a
  // `<select id={undefined}>` and no accessible name at all. axe calls that
  // critical. `useId` gives one when the caller does not.
  const autoId = useId();
  const fieldId = id ?? autoId;

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

  // Flex container style (matching Input.tsx):
  // display: flex, alignItems: center, gap: SPACING[2] (8px), padding: SPACING[3] (12px)
  const containerStyle = {
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
    transition: reducedMotion ? 'none' : LiminalMotionEngine.TRANSITION.slow,
    // NO `background`. The layer owns it — see data-liminal-surface.
    // An inline background beats the CSS rule, so this line cancelled the
    // hover the component had just opted into. Fifth time this session.
    // Only the width and style. `borderColor` belongs to the layer, which
    // changes it on focus — an inline shorthand would cancel that too.
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
  } as CSSProperties;

  // Internal <select> element style:
  // appearance: none, flex: 1, border: none, background: transparent, padding: 0
  const selectElementStyle: CSSProperties = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: effectiveValue
      ? getTextStyle('primary', surfaceLevel).color
      : getTextStyle('quaternary', surfaceLevel).color,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(3), // 16px
    lineHeight: TYPOGRAPHY[3].lh,
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'start',
  };

  const labelStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    letterSpacing: TYPOGRAPHY[2].ls,
    fontWeight: 500,
    color: getTextStyle('secondary', surfaceLevel).color,
    marginBottom: `${SPACING[1]}px`, // 4px
    userSelect: 'none',
    textAlign: 'start',
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
    marginTop: `${SPACING[1]}px`, // 4px
    textAlign: 'start',
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    if (value === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  const handleFocus = (e: FocusEvent<HTMLSelectElement>) => {
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
    onBlur?.(e);
  };

  // Caret icon color logic: getTextStyle('tertiary', surfaceLevel), hover: getTextStyle('secondary', surfaceLevel)
  const isCaretActiveHover = false; // the caret is driven by CSS now
  const caretColor = isCaretActiveHover
    ? getTextStyle('secondary', surfaceLevel).color
    : getTextStyle('tertiary', surfaceLevel).color;

  const caretNode = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        pointerEvents: 'none', // click passes straight to native <select>
        color: caretColor,
        transition: reducedMotion
          ? 'none'
          : LiminalMotionEngine.getTransition('color', 'fast'),
      }}
      aria-hidden="true"
    >
      <LiminalIcon icon={CaretDown} size="sm" weight="light" />
    </div>
  );

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
        // The wrapper sets `--liminal-surface-hover` and never opted in, so the
        // layer's hover rule could not reach it: the variable was published and
        // nothing read it. `data-liminal-focus-within` gives focus; this is what
        // gives hover and the idle fill.
        data-liminal-surface=""
        data-liminal-focus-within=""
        data-liminal-disabled={disabled ? "" : undefined}
        style={containerStyle}
      >
        {/* If prefix is provided */}
        {prefix && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              color: getTextStyle('tertiary', surfaceLevel).color,
            }}
          >
            {prefix}
          </div>
        )}

        {/* If Caret is positioned on the LEFT (standard in RTL) */}
        {!caretAtEnd && caretNode}

        {/* Native <select> with appearance: none */}
        <select
          ref={setSelectRef}
          id={fieldId}
          name={name}
          value={effectiveValue}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={selectElementStyle}
        >
          {placeholder && (
            <option value="" disabled hidden={Boolean(effectiveValue)}>
              {placeholder}
            </option>
          )}

          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  style={{
                    // A native <option> is drawn by the OS; this is the menu surface.
                    background: resolveSurface({ role: 'menu' }).background,
                    color: opt.disabled ? getTextStyle('quaternary', 4).color : getTextStyle('primary', 4).color,
                  }}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* If Caret is positioned on the RIGHT (standard in LTR) */}
        {caretAtEnd && caretNode}

        {/* If suffix is provided */}
        {suffix && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              color: getTextStyle('tertiary', surfaceLevel).color,
            }}
          >
            {suffix}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <span style={helperStyle}>{error || helperText}</span>
      )}
    </div>
  );
});

export default Select;
