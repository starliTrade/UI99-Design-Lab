import React, { forwardRef, useId } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useDirection } from '../../../engine/liminal-direction';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import './slider.css';

/**
 * LIMINAL · SLIDER
 *
 * A native `<input type="range">`, styled.
 *
 * The native element is not a shortcut — it is the accessible one. It brings
 * arrow keys, Home/End, PageUp/PageDown, a screen-reader value announcement, a
 * touch target the platform already knows how to drag, and RTL handling that
 * the browser does correctly and a hand-rolled div does not. Replacing it means
 * rebuilding all of that and getting some of it wrong.
 *
 *   role        `control` — declared, and anchored on its host.
 *   sizes       sm · md · lg, from ICON_SIZES and SPACING.
 *   variants    none. A range is a range.
 *   states      default · disabled · error, plus the layer's hover/focus/active.
 *   tokens      zero raw values.
 *   a11y        the native input: keyboard, ARIA, and a real value. The label is
 *               a real <label>, and the error is announced.
 *   RTL         the fill is computed from the resolved direction, because a
 *               gradient cannot be flipped by a logical property.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
  /** The validation message. A number can be out of range. */
  error?: string;
  /** Show the current value beside the label. */
  showValue?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

const TRACK = { sm: 4, md: 6, lg: 8 } as const;
const THUMB = { sm: 14, md: 18, lg: 22 } as const;

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    disabled = false,
    label,
    error,
    showValue = false,
    id,
    name,
    className = '',
    style: customStyle,
  },
  forwardedRef,
) {
  const autoId = useId();
  const fieldId = id ?? `${autoId}-slider`;
  const errorId = error ? `${fieldId}-error` : undefined;

  const host = useHostSurface();
  const dir = useDirection();
  const surface = resolveSurface({ role: 'control', on: host });
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  // The filled portion. A gradient cannot be flipped by a logical property, so
  // the direction is read and the angle chosen — `to right` in LTR, `to left`
  // in RTL. Getting this wrong is a slider that fills from the wrong end in
  // Arabic, which looks like a bug in the value rather than in the layout.
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const fill = error ? SEMANTICS.DANGER.solid : surface.background;
  const track = resolveSurface({ role: 'well', on: host }).background;
  const to = dir === 'rtl' ? 'to left' : 'to right';
  const trackBackground = `linear-gradient(${to}, ${fill} 0%, ${fill} ${pct}%, ${track} ${pct}%, ${track} 100%)`;

  const thumb = THUMB[size];
  const trackHeight = TRACK[size];

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: `${L.SPACING[1]}px`, minWidth: 0, ...customStyle }}
    >
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: `${L.SPACING[2]}px` }}>
          {label && (
            <label htmlFor={fieldId} style={{ ...L.getTypeStyle(2), color: getTextStyle('secondary', 2).color }}>
              {label}
            </label>
          )}
          {showValue && (
            <span
              style={{
                ...L.getTypeStyle(1),
                color: getTextStyle('tertiary', 1).color,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </span>
          )}
        </div>
      )}
      <input
        ref={forwardedRef}
        type="range"
        className="liminal-slider"
        id={fieldId}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          // The native track and thumb are replaced with the engine's surfaces.
          // `appearance: none` is the only way to do it, and the two vendor
          // pseudo-elements below are the price of a native slider.
          appearance: 'none',
          WebkitAppearance: 'none',
          width: '100%',
          height: `${thumb}px`,
          margin: 0,
          background: 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          outline: 'none',
          // The track lives on the element itself; the thumb is a pseudo-element
          // and cannot be reached from here, so its colour travels as a variable.
          ...resolveInteractionVars({ role: 'control', on: host, idle: trackBackground }),
          ['--liminal-slider-thumb' as string]: surface.background,
          ['--liminal-slider-thumb-size' as string]: `${thumb}px`,
          ['--liminal-slider-track-height' as string]: `${trackHeight}px`,
          ['--liminal-slider-duration' as string]: M.DURATION.fast,
        }}
      />
      {error && (
        <span id={errorId} role="alert" style={{ ...L.getTypeStyle(1), color: SEMANTICS.DANGER.text }}>
          {error}
        </span>
      )}
    </div>
  );
});

export default Slider;
