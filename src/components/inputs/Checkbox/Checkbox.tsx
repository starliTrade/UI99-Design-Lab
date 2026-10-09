import React, { useState } from 'react';
import type { CSSProperties, KeyboardEvent, ChangeEvent } from 'react';
import {
  getDirectionalRim,
  getTextStyle,
  LADDER,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  id,
  name,
  className = '',
  style: customStyle = {},
}: CheckboxProps) {
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const offRim = getDirectionalRim(2, 2, false);

  const focusRing = LiminalComponentEngine.getFocusRing(isKeyboardFocused);

  const boxStyle: CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: `${RADIUS.chip}px`, // 6px
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
    outline: focusRing.outline,
    outlineOffset: focusRing.outlineOffset ?? '2px',
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
      onChange(!checked);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
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
        type="checkbox"
        id={id}
        name={name}
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

      <span style={boxStyle}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: checked ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: SEMANTICS.SUCCESS.solid,
          }}
        >
          <path
            d="M2.5 6.2L4.8 8.5L9.5 3.8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {label && <span style={labelStyle}>{label}</span>}
    </label>
  );
}

export default Checkbox;
