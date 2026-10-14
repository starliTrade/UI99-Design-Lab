import React, { forwardRef, useCallback, useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { FOCUS_RING_COLOR } from '../../../engine/liminal-ladder';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · OTP
 *
 * A one-time code field. It is ONE input, and that is the whole design.
 *
 * The obvious implementation is N inputs, one per digit. It is also the wrong
 * one, and the failures are not cosmetic:
 *
 *   PASTE      a code arrives as a single string and N inputs have nowhere to
 *              put it. Every N-input OTP in the wild hand-rolls paste handling,
 *              and most of them get the caret and the overflow wrong.
 *   AUTOFILL   `autocomplete="one-time-code"` is a property of ONE field. Split
 *              across six, the platform has nothing to fill.
 *   ANNOUNCE   a screen reader meets six unlabelled text boxes instead of one
 *              field called "Verification code".
 *
 * So: one real input, visually transparent, sitting over six boxes that render
 * the digits. The reader sees boxes; the platform sees a field.
 *
 *   role        `control`, anchored on its host.
 *   sizes       sm · md · lg.
 *   variants    none.
 *   states      default · disabled · error · complete.
 *   tokens      zero raw values.
 *   a11y        ONE labelled field with `inputmode="numeric"` and
 *               `autocomplete="one-time-code"`; the boxes are `aria-hidden`
 *               because they are a rendering of the value, not controls.
 *   RTL         the boxes are a logical row; the digits are not mirrored.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface OTPProps {
  value: string;
  onChange: (value: string) => void;
  /** How many digits. Also the input's maxLength. */
  length?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  disabled?: boolean;
  /** Called when the last digit arrives, so a consumer does not poll. */
  onComplete?: (value: string) => void;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
}

const BOX = { sm: 34, md: 44, lg: 52 } as const;

export const OTP = forwardRef<HTMLInputElement, OTPProps>(function OTP(
  {
    value,
    onChange,
    length = 6,
    size = 'md',
    label,
    error,
    disabled = false,
    onComplete,
    id,
    name,
    autoFocus = false,
    className = '',
    style: customStyle,
  },
  forwardedRef,
) {
  const autoId = useId();
  const fieldId = id ?? `${autoId}-otp`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const host = useHostSurface();
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const innerRef = useRef<HTMLInputElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [forwardedRef],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Digits only. A code field that accepts letters is a code field that
      // rejects the code at the server instead of at the keyboard.
      const digits = e.target.value.replace(/\D/g, '').slice(0, length);
      onChange(digits);
      if (digits.length === length) onComplete?.(digits);
    },
    [length, onChange, onComplete],
  );

  const boxSize = BOX[size];
  const complete = value.length === length;
  // The WELL's rim, not just its fill.
  //
  // Measured in a browser: a `well` is one step below the panel it sits on, and
  // a one-step difference is FELT rather than SEEN — which is the right rule for
  // a state change and the wrong one for a target. An OTP box is somewhere the
  // reader must aim, and a box that is felt but not seen is a box they cannot
  // find. The rim is what makes it an object.
  const boxSurface = resolveSurface({ role: 'well', on: host });
  const boxIdle = boxSurface.rimColors?.cssBackground ?? boxSurface.background;

  const digitStyle: CSSProperties = {
    ...L.getTypeStyle(3),
    color: getTextStyle('primary', 3).color,
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: `${L.SPACING[1]}px`, minWidth: 0, ...customStyle }}
    >
      {label && (
        <label htmlFor={fieldId} style={{ ...L.getTypeStyle(2), color: getTextStyle('secondary', 2).color }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'inline-flex', gap: `${L.SPACING[1]}px` }}>
        {/* The boxes are a RENDERING of the value, not controls. `aria-hidden`
            because a screen reader should meet one field, not six boxes. */}
        <div aria-hidden style={{ display: 'inline-flex', gap: `${L.SPACING[1]}px` }}>
          {Array.from({ length }, (_, i) => {
            const filled = i < value.length;
            const active = i === value.length && !disabled;
            return (
              <span
                key={i}
                data-liminal-surface=""
                style={{
                  width: boxSize,
                  height: boxSize,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: `${L.RADIUS.control}px`,
                  boxSizing: 'border-box',
                  transition: M.getTransition('background', 'fast'),
                  ...resolveInteractionVars({
                    role: 'control',
                    on: host,
                    idle: error ? SEMANTICS.DANGER.subtle : boxIdle,
                    borderFocus: active ? FOCUS_RING_COLOR : undefined,
                  }),
                  ...(active ? { outline: `2px solid ${FOCUS_RING_COLOR}`, outlineOffset: 2 } : null),
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {filled ? <span style={digitStyle}>{value[i]}</span> : null}
              </span>
            );
          })}
        </div>

        {/* ONE field, over the boxes. Transparent, so the boxes are what the
            reader sees; real, so paste, autofill and the screen reader all work
            on a single control. */}
        <input
          ref={setRefs}
          id={fieldId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={length}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={handleChange}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'text',
            // The caret is invisible but the field is real: `caret-color` rather
            // than hiding the input, because a hidden input is not focusable in
            // every browser and an unfocusable OTP cannot be typed into.
            caretColor: 'transparent',
          }}
        />
      </div>

      {error && (
        <span id={errorId} role="alert" style={{ ...L.getTypeStyle(1), color: SEMANTICS.DANGER.text }}>
          {error}
        </span>
      )}
      {!error && complete && (
        <span role="status" style={{ ...L.getTypeStyle(1), color: getTextStyle('tertiary', 1).color }}>
          {length} digits entered
        </span>
      )}
    </div>
  );
});

export default OTP;
