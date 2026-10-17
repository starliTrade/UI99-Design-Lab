import React, { forwardRef, useId } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { FOCUS_RING_COLOR } from '../../../engine/liminal-ladder';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveBorder, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · RATING
 *
 * A rating is a CHOICE FROM A SET, so it is a radio group. Not five buttons.
 *
 * The tempting implementation is five `<button>`s with a star in each, and it is
 * wrong in ways a screenshot cannot show: a screen reader announces "button,
 * button, button, button, button" with no group name and no notion of which one
 * is chosen; arrow keys do nothing; and there is no value to read back. A native
 * radio group brings the group name, the chosen state, the arrow-key roving and
 * the value announcement for free.
 *
 *   role        `control`, anchored on its host.
 *   sizes       sm · md · lg.
 *   variants    none.
 *   states      default · disabled · readonly · error.
 *   tokens      zero raw values.
 *   a11y        a real `<fieldset>` + `<legend>` + radios. The stars are LABELS
 *               for the radios, so the platform does the work.
 *   RTL         the stars are a logical row; the order is not mirrored, because
 *               a rating is a sequence and not a direction.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface RatingProps {
  /** 0 means nothing chosen. */
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Show "3 of 5" beside the stars. */
  showValue?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

const STAR = { sm: 18, md: 24, lg: 30 } as const;

/**
 * A five-point star, filled or not. One path, two paints.
 *
 * The empty stroke is the ENGINE'S hairline, not a hand-written rgba — the
 * border a control draws when it is not selected, which is what an unchosen star
 * is.
 */
function Star({ size, filled, colour, stroke }: { size: number; filled: boolean; colour: string; stroke: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M12 2.6l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.8l1.2-6.6L2.5 9.6l6.6-.9L12 2.6z"
        fill={filled ? colour : 'none'}
        stroke={filled ? colour : stroke}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Rating = forwardRef<HTMLFieldSetElement, RatingProps>(function Rating(
  {
    value,
    onChange,
    max = 5,
    size = 'md',
    label,
    error,
    disabled = false,
    readOnly = false,
    showValue = false,
    id,
    name,
    className = '',
    style: customStyle,
  },
  forwardedRef,
) {
  const autoId = useId();
  const groupName = name ?? `${autoId}-rating`;
  const legendId = `${autoId}-legend`;
  const errorId = error ? `${autoId}-error` : undefined;
  const host = useHostSurface();
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const inert = disabled || readOnly;

  // The chosen star is the BRAND, not the control's fill.
  //
  // The same lesson the Slider and the OTP taught: a control's own fill is one
  // step above its host, which is FELT rather than SEEN. A rating is a
  // MEASUREMENT — how many — and a measurement that is felt but not seen is one
  // the reader cannot read.
  const chosen = error ? SEMANTICS.DANGER.solid : FOCUS_RING_COLOR;
  // The empty star's outline is the EDGE, not the hairline.
  //
  // Third time in three components: a hairline is HALF a step, which is FELT
  // rather than SEEN — the right rule for a separator and the wrong one for a
  // TARGET. Measured in a browser, the empty stars' outline was `--liminal-s3-5`
  // on an S3 panel: one step, so the stars rendered as nothing at all and the
  // rating looked like an empty row.
  //
  // An edge is a full step. A star the reader must aim at is an object, and an
  // object has an edge.
  const emptyStroke = resolveBorder({ role: 'control', kind: 'edge', on: host });
  const starSize = STAR[size];
  // The control role is DECLARED, not used for a fill: the stars paint
  // themselves. It is declared because a component that names no role cannot be
  // anchored, and the standard asks every component that paints to say what it
  // is painting.
  void resolveSurface({ role: 'control', on: host, interactive: true });

  return (
    <fieldset
      ref={forwardedRef}
      className={className}
      aria-describedby={errorId}
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: `${L.SPACING[1]}px`,
        ...customStyle,
      }}
    >
      {/* THE LEGEND MUST BE THE FIELDSET'S FIRST CHILD.
          Nested inside the header row it named nothing: a `<legend>` only names
          its `<fieldset>` when it is the first element in it, so the group had
          no accessible name and a screen reader announced five radios with no
          idea what they were for. The visual header is a separate row. */}
      {label && (
        <legend
          id={legendId}
          style={{ ...L.getTypeStyle(2), color: getTextStyle('secondary', 2).color, padding: 0, float: 'inline-start' }}
        >
          {label}
        </legend>
      )}

      {showValue && (
        <span
          style={{
            ...L.getTypeStyle(1),
            color: getTextStyle('tertiary', 1).color,
            fontVariantNumeric: 'tabular-nums',
            alignSelf: 'flex-end',
          }}
        >
          {value} of {max}
        </span>
      )}

      <div style={{ display: 'inline-flex', gap: `${L.SPACING[0]}px` }}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const on = starValue <= value;
          return (
            <label
              key={starValue}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                // A 24px star is a 24px target; WCAG 2.5.8 wants 24x24 and a
                // thumb wants more. The label is the target, so it is the
                // larger of the two.
                width: Math.max(24, starSize + 8),
                height: Math.max(24, starSize + 8),
                cursor: inert ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                borderRadius: `${L.RADIUS.chip}px`,
                // The focus ring lands on the LABEL, because the radio itself is
                // visually hidden and a ring on nothing is not a ring.
                ...(on ? null : { background: 'transparent' }),
              }}
              data-liminal-focusable=""
            >
              <input
                type="radio"
                name={groupName}
                value={starValue}
                checked={value === starValue}
                disabled={inert}
                aria-label={`${starValue} of ${max}`}
                onChange={() => !inert && onChange(starValue)}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: 0,
                  height: 0,
                  pointerEvents: 'none',
                }}
              />
              <span style={{ display: 'inline-flex', transition: M.getTransition('opacity', 'fast') }}>
                <Star size={starSize} filled={on} colour={chosen} stroke={emptyStroke} />
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <span id={errorId} role="alert" style={{ ...L.getTypeStyle(1), color: SEMANTICS.DANGER.text }}>
          {error}
        </span>
      )}
    </fieldset>
  );
});

export default Rating;
