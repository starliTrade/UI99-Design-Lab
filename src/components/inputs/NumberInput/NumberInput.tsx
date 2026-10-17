import React, { forwardRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { Input } from '../Input/Input';

/**
 * LIMINAL · NUMBER INPUT
 *
 * A number field with steppers. It WRAPS `Input` rather than rebuilding it, and
 * that is the whole design: the Input already carries the size scale, the error
 * state, the helper text, the ARIA wiring and the interaction layer. A second
 * implementation would be a second answer for all of it.
 *
 * The lesson it was built with: `DatePicker` wraps an `Input` too, and never
 * passed `error` through — a prop that stopped one layer short and stayed
 * invisible until something downstream needed it. Every prop here reaches the
 * Input, and the test asserts it.
 *
 *   role        `control`, through the Input.
 *   sizes       sm · md · lg, through the Input.
 *   variants    none. A number is a number.
 *   states      default · disabled · readonly · error.
 *   tokens      zero raw values.
 *   a11y        `type="number"` gives a spinbutton with arrow-key support for
 *               free; the steppers are real buttons with names, and each is
 *               24px wide — the WCAG 2.5.8 minimum — because a stepper is a
 *               secondary target and shrinking it below the floor is how a
 *               control becomes unusable for a thumb.
 *   RTL         the steppers sit in the Input's `suffix`, which is logical.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface NumberInputProps {
  /** An empty string is a legitimate value: an empty field is not zero. */
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    onChange,
    min,
    max,
    step = 1,
    size = 'md',
    label,
    placeholder,
    error,
    helperText,
    disabled = false,
    readOnly = false,
    id,
    name,
    className,
    style: customStyle,
  },
  forwardedRef,
) {
  const host = useHostSurface();
  const inert = disabled || readOnly;

  const clamp = useCallback(
    (next: number) => {
      let v = next;
      if (min !== undefined) v = Math.max(min, v);
      if (max !== undefined) v = Math.min(max, v);
      return v;
    },
    [min, max],
  );

  const bump = useCallback(
    (direction: 1 | -1) => {
      if (inert) return;
      const current = value === '' ? (min ?? 0) : value;
      onChange(clamp(current + direction * step));
    },
    [inert, value, min, step, clamp, onChange],
  );

  const stepperStyle: CSSProperties = {
    // A CONTROL, declared. The steppers are buttons and they say so.
    ...resolveSurface({ role: 'control', on: host, interactive: true }).style,
    font: 'inherit',
    fontSize: 11,
    lineHeight: 1,
    width: 24, // WCAG 2.5.8: a secondary target is at least 24x24.
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    cursor: inert ? 'not-allowed' : 'pointer',
    opacity: inert ? 0.5 : 1,
  };

  return (
    <div className={className} style={{ minWidth: 0, ...customStyle }}>
      <Input
        ref={forwardedRef}
        type="number"
        id={id}
        name={name}
        size={size}
        label={label}
        placeholder={placeholder}
        value={value === '' ? '' : String(value)}
        error={error}
        helperText={helperText}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(e) => {
          const raw = e.target.value;
          // An empty field stays empty. Coercing it to 0 is how a reader who
          // cleared the box to retype gets a zero they never asked for.
          onChange(raw === '' ? '' : clamp(Number(raw)));
        }}
        suffix={
          <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
            <button
              type="button"
              aria-label="Increase"
              disabled={inert}
              tabIndex={inert ? -1 : 0}
              onClick={() => bump(1)}
              style={stepperStyle}
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Decrease"
              disabled={inert}
              tabIndex={inert ? -1 : 0}
              onClick={() => bump(-1)}
              style={stepperStyle}
            >
              ▼
            </button>
          </span>
        }
      />
    </div>
  );
});

export default NumberInput;
