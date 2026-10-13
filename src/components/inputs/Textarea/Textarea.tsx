import React, { useState, useEffect, useRef, useId } from 'react';
import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getTextStyle,
  LiminalState,
} from '../../../engine/spec-engine';
import { resolveSurface, resolveBorder, resolveInteractionVars } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';

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
  maxLength?: number;
  showCount?: boolean;
  rows?: number;
  name?: string;
  id?: string;
  required?: boolean;
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
  maxLength,
  showCount = false,
  rows = 4,
  name,
  id,
  required = false,
  className = '',
  style: customStyle = {},
}: TextareaProps) {
  const [internalVal, setInternalVal] = useState<string>(value ?? defaultValue ?? '');

  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value);
    }
  }, [value]);

  const effectiveValue = value !== undefined ? value : internalVal;
  const currentLength = effectiveValue.length;

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const surfaceLevel = 2;


  // Resolve base interactive style from engine
  // The interaction states are CSS's job now (:hover, :focus-within). Only the
  // validation states stay in JavaScript — they depend on props, not on what
  // the pointer or the keyboard is doing.
  const host = useHostSurface();
  const idleSurface = resolveSurface({ role: 'control', on: host }).background;

  const ringColor = error
    ? SEMANTICS.DANGER.solid
    : success
    ? SEMANTICS.SUCCESS.solid
    : LiminalColorEngine.BRAND_PRIMARY.hex;

  let background = idleSurface;
  const borderColor = resolveBorder({ role: 'control', kind: 'edge', on: host });
  let border = `1px solid ${borderColor}`;

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
    flexDirection: 'column',
    padding: `${SPACING[3]}px`, // 12px
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
    cursor: disabled ? 'not-allowed' : 'text',
  } as CSSProperties;

  const textareaElementStyle: CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    color: getTextStyle('primary', surfaceLevel).color,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(3), // 16px
    lineHeight: 1.6,
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    resize: 'vertical',
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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setInternalVal(e.target.value);
    }
    onChange?.(e);
  };

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
        // The wrapper publishes all six variables through the producer.
        // `data-liminal-surface` gives hover and the idle fill;
        // `data-liminal-focus-within` gives focus.
        data-liminal-surface=""
        data-liminal-focus-within=""
        data-liminal-disabled={disabled ? "" : undefined}
        style={fieldWrapperStyle}
      >
        <textarea
          ref={localTextareaRef}
          id={fieldId}
          name={name}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-describedby={ariaDescribedBy}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          style={textareaElementStyle}
        />
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
}

export default Textarea;

