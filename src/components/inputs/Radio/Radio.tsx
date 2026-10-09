import React, { useState } from 'react';
import type { CSSProperties, KeyboardEvent, ChangeEvent } from 'react';
import {
  getDirectionalRim,
  getTextStyle,
  getLadderColor,
  getFocusRing,
  LADDER,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface RadioProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
  name: string;
  value: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export function Radio({
  checked,
  onChange,
  disabled = false,
  label,
  name,
  value,
  id,
  className = '',
  style: customStyle = {},
}: RadioProps) {
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const offRim = getDirectionalRim(2, 2, false);

  const circleStyle: CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    transition: LiminalMotionEngine.TRANSITION.normal,
    background: checked
      ? SEMANTICS.SUCCESS.subtle
      : offRim
      ? offRim.cssBackground
      : LADDER[2],
    border: checked
      ? `1px solid ${SEMANTICS.SUCCESS.border}`
      : offRim
      ? '1px solid transparent'
      : `1px solid ${LADDER[3]}`,
    ...getFocusRing(isKeyboardFocused),
  };

  const dotStyle: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: SEMANTICS.SUCCESS.solid,
    transform: checked ? 'scale(1)' : 'scale(0)',
    transition: LiminalMotionEngine.getTransition('transform', 'normal', 'spring'),
  };

  const labelStyle: CSSProperties = {
    color: getTextStyle('secondary', 2).color,
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    fontWeight: 400,
    lineHeight: TYPOGRAPHY[2].lh,
    userSelect: 'none',
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (disabled) return;
    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.checked) {
      onChange();
    }
  };

  return (
    <label
      htmlFor={id}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsKeyboardFocused(false)}
      onBlur={() => setIsKeyboardFocused(false)}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${SPACING[2]}px`, // 8px
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        boxSizing: 'border-box',
        outline: 'none',
        ...customStyle,
      }}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        tabIndex={-1}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />

      <span style={circleStyle}>
        <span style={dotStyle} />
      </span>

      {label && <span style={labelStyle}>{label}</span>}
    </label>
  );
}

export default Radio;
