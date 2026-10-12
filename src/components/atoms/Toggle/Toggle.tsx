import React from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import {getDirectionalRim, getLadderColor, SURFACE_TINT, SHADOWS } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

export interface ToggleProps {
  checked?: boolean;
  value?: boolean;
  on?: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Toggle({
  checked,
  value,
  on,
  onChange,
  disabled = false,
  className = '',
  style: customStyle = {},
  'aria-label': ariaLabel = 'Toggle switch',
}: ToggleProps) {
  const host = useHostSurface();
  const isChecked = checked ?? value ?? on ?? false;
  const brand = LiminalColorEngine.BRAND_PRIMARY;
  const offRim = getDirectionalRim(2, 2, false);

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

  const trackStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '44px',
    height: `${LiminalLayoutEngine.SPACING[5]}px`,
    borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`, // 9999px
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: LiminalMotionEngine.TRANSITION.slow,
    userSelect: 'none',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    background: isChecked
      ? brand.hex
      : offRim
      ? offRim.cssBackground
      : resolveSurface({ role: 'control', on: host }).background,
    // NO `outline: none` here. It cancelled the layer's :focus-visible ring, so
    // the switch had NO visible focus at all — WCAG 2.4.7. The layer owns focus;
    // `data-liminal-focusable` below opts in.
    padding: 0,
    ...customStyle,
  };

  const knobStyle: CSSProperties = {
    position: 'absolute',
    top: '3px',
    width: `${LiminalLayoutEngine.SPACING[4]}px`,
    height: `${LiminalLayoutEngine.SPACING[4]}px`,
    borderRadius: '50%',
    transition: LiminalMotionEngine.TRANSITION.slow,
    // In compliance with LIMINAL Master Spec:
    // checked=true: knob right 23px, background #060709
    // checked=false: knob right 3px, background rgba(255,255,255,.4)
    // The knob travels along the INLINE axis: it starts at the beginning and
    // moves toward the end. A physical `right` would leave it travelling
    // backwards in RTL.
    insetInlineEnd: isChecked ? '23px' : '3px',
    background: isChecked ? brand.onColor : SURFACE_TINT.solid,
    boxShadow: SHADOWS[1],
  };

  return (
    <button
      type="button"
      role="switch"
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
