import React from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import {getDirectionalRim, getLadderColor, SURFACE_TINT, SHADOWS } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { resolveSurface, resolveInteractionVars } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/** The knob's inset from the track edge: a visual decision, so it is named. */
/**
 * The three sizes, derived rather than drawn.
 *
 * `track` is the engine's control width; `knob` and `inset` are spacing steps.
 * The height is the knob plus its two insets, so a size cannot end up with a
 * knob that does not fit — which is what a hand-written height eventually does.
 */
const SWITCH = {
  sm: { track: LiminalLayoutEngine.CONTROL.sm, knob: LiminalLayoutEngine.SPACING[4] - LiminalLayoutEngine.SPACING[0], inset: LiminalLayoutEngine.SPACING[0] },
  md: { track: LiminalLayoutEngine.CONTROL.md, knob: LiminalLayoutEngine.SPACING[4], inset: LiminalLayoutEngine.SPACING[0] + LiminalLayoutEngine.BORDER.hairline },
  lg: { track: LiminalLayoutEngine.CONTROL.lg, knob: LiminalLayoutEngine.SPACING[5] - LiminalLayoutEngine.SPACING[0], inset: LiminalLayoutEngine.SPACING[1] },
} as const;

/**
 * How far the knob travels: the track, minus its two hairline borders, minus the
 * knob, minus the inset it starts at. The old value was the literal `23px`.
 */
const travel = (size: keyof typeof SWITCH) => {
  const s = SWITCH[size];
  return s.track - 2 * LiminalLayoutEngine.BORDER.hairline - s.knob - s.inset;
};

const CONTROL = LiminalLayoutEngine.CONTROL;

export interface ToggleProps {
  /** Whether it is on. The one name this should have had. */
  checked?: boolean;
  /**
   * @deprecated An alias of `checked`. Three names for one boolean is three
   * things a consumer has to learn and three ways to be inconsistent — the
   * component reads all of them, and the API table is what made that visible.
   */
  value?: boolean;
  /**
   * @deprecated An alias of `checked`. Use `checked`.
   */
  on?: boolean;
  /** Reports the NEXT value, not the event. A switch is a boolean, not a DOM
   *  node, and every consumer was writing `e.target.checked` to get here. */
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /**
   * The switch's size, from the engine's control scale.
   *
   * It had none, and the system's own standard says a control needs them: a
   * switch that only exists at one size is a switch that cannot sit in a dense
   * toolbar or beside a large button. The track takes its width from `CONTROL`,
   * the knob from `SPACING`, and the travel is COMPUTED from the two rather than
   * written down — the old `23px` was correct only for the one size that
   * existed, which is exactly how a hard-coded number hides.
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  /** Required when there is no visible label. */
  'aria-label'?: string;
}

export function Toggle({
  checked,
  value,
  on,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  style: customStyle = {},
  'aria-label': ariaLabel = 'Toggle switch',
}: ToggleProps) {
  const dims = SWITCH[size];
  const host = useHostSurface();
  const isChecked = checked ?? value ?? on ?? false;
  const brand = LiminalColorEngine.BRAND_PRIMARY;
  // The fill an unselected control rests in: a named role, not a hand-picked pair.
  const offRim = resolveSurface({ role: 'well' }).rimColors;

  const handleClick = () => {
    if (!disabled) {
      onChange(!isChecked);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!isChecked);
    }
  };

  const trackBg = isChecked
    ? brand.hex
    : offRim
    ? offRim.cssBackground
    : resolveSurface({ role: 'control', on: host }).background;

  const trackStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: dims.track,
    height: `${dims.knob + 2 * dims.inset}px`,
    borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`, // 9999px
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: LiminalMotionEngine.TRANSITION.slow,
    userSelect: 'none',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    // The layer owns the surface. The switch publishes its states and stops
    // setting `background` itself — an inline background beats the CSS rule, so
    // the hover the layer would have applied could never arrive.
    //
    // A CHECKED switch keeps its fill in EVERY state — the contract's rule for a
    // control already in a chosen state. An unchecked one lifts on hover and
    // sinks below its rest on press, which is the engine's own STATE_SHIFT:
    // hover +0.5, active -0.5.
    ...resolveInteractionVars({
      role: 'control',
      on: host,
      idle: trackBg,
      frozen: isChecked ? trackBg : undefined,
    }),
    // NO `outline: none` here. It cancelled the layer's :focus-visible ring, so
    // the switch had NO visible focus at all — WCAG 2.4.7. The layer owns focus;
    // `data-liminal-focusable` below opts in.
    padding: 0,
    ...customStyle,
  } as CSSProperties;

  const knobStyle: CSSProperties = {
    position: 'absolute',
    top: `${dims.inset}px`,
    width: `${dims.knob}px`,
    height: `${dims.knob}px`,
    borderRadius: '50%',
    transition: LiminalMotionEngine.TRANSITION.slow,
    // In compliance with LIMINAL Master Spec:
    // checked=true: knob right 23px, background #060709
    // checked=false: knob right 3px, background rgba(255,255,255,.4)
    // The knob travels along the INLINE axis: it starts at the beginning and
    // moves toward the end. A physical `right` would leave it travelling
    // backwards in RTL.
    insetInlineEnd: `${isChecked ? travel(size) : dims.inset}px`,
    background: isChecked ? brand.onColor : SURFACE_TINT.solid,
    boxShadow: SHADOWS[1],
  };

  return (
    <button
      type="button"
      role="switch"
      data-liminal-surface=""
      data-liminal-focusable=""
      aria-checked={isChecked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      style={trackStyle}
    >
      <span style={knobStyle} />
    </button>
  );
}

export default Toggle;
