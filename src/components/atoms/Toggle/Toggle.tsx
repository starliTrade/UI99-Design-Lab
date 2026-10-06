import React from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { getDirectionalRim } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  className = '',
  style: customStyle = {},
  'aria-label': ariaLabel = 'Toggle switch',
}: ToggleProps) {
  const brand = LiminalColorEngine.BRAND_PRIMARY;
  const offRim = getDirectionalRim(2, 2, false);

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const trackStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '44px',
    height: '24px',
    borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`, // 9999px
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.25s ease',
    userSelect: 'none',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    background: checked
      ? brand.hex
      : offRim
      ? offRim.cssBackground
      : '#0D0E12',
    outline: 'none',
    padding: 0,
    ...customStyle,
  };

  const knobStyle: CSSProperties = {
    position: 'absolute',
    top: '3px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    transition: 'all 0.25s ease',
    // In compliance with LIMINAL Master Spec:
    // checked=true: knob right 23px, background #060709
    // checked=false: knob right 3px, background rgba(255,255,255,.4)
    right: checked ? '23px' : '3px',
    background: checked ? brand.onColor : 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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
