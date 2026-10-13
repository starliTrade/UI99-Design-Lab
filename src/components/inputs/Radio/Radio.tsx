import { resolveSurface, resolveInteractionVars } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import React from 'react';
import type { CSSProperties, KeyboardEvent, ChangeEvent } from 'react';
import {
  getDirectionalRim,
  getTextStyle,
  getLadderColor,
  LADDER,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { ICON_SIZES } from '../../../engine/liminal-icon-engine';

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

  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const host = useHostSurface();

  const offRim = getDirectionalRim(2, 2, false);

  const boxBg = checked
    ? SEMANTICS.SUCCESS.subtle
    : offRim
    ? offRim.cssBackground
    : LADDER[2];

  const circleStyle: CSSProperties = {
    width: ICON_SIZES.md,
    height: ICON_SIZES.md,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    transition: LiminalMotionEngine.TRANSITION.normal,
    // The layer owns the surface — see data-liminal-surface. An inline
    // background beats the CSS rule, so this line cancelled the hover.
    //
    // A CHECKED box keeps its fill in EVERY state; an unchecked one lifts on
    // hover and sinks below its rest on press.
    ...resolveInteractionVars({
      role: 'control',
      on: host,
      idle: boxBg,
      frozen: checked ? boxBg : undefined,
    }),
    border: checked
      ? `1px solid ${SEMANTICS.SUCCESS.border}`
      : offRim
      ? '1px solid transparent'
      : `1px solid ${LADDER[3]}`,
  } as CSSProperties;

  const dotStyle: CSSProperties = {
    width: ICON_SIZES.md / 2,
    height: ICON_SIZES.md / 2,
    borderRadius: '50%',
    background: SEMANTICS.SUCCESS.solid,
    transform: checked ? 'scale(1)' : 'scale(0)',
    transition: LiminalMotionEngine.getTransition('transform', 'normal', 'spring'),
  };

  const labelStyle: CSSProperties = {
    color: getTextStyle('secondary', 2).color,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    fontWeight: 400,
    lineHeight: TYPOGRAPHY[2].lh,
    userSelect: 'none',
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (disabled) return;
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
      onKeyDown={handleKeyDown}
      data-liminal-focusable=""
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${SPACING[2]}px`, // 8px
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        boxSizing: 'border-box',
        // NO `outline: none` here. An inline style beats a CSS rule, so it
        // would silently cancel the layer's :focus-visible ring — which is
        // exactly what the eye test caught. The layer owns focus now.
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
        tabIndex={disabled ? -1 : 0}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />

      <span data-liminal-surface="" style={circleStyle}>
        <span style={dotStyle} />
      </span>

      {label && <span style={labelStyle}>{label}</span>}
    </label>
  );
}

export default Radio;
