import React from 'react';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { SpecEngine } from '../../engine/spec-engine';

export interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ on, onChange, disabled = false, className = '' }: ToggleProps) {
  // When off: Surface 3 background (#0D0E12) with Directional Specular Rim 2
  // When on: Brand Primary (#E9ECF2) with on-color knob (#060709)
  const offRim = SpecEngine.getRim(3, 2);

  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`relative inline-flex items-center transition-all cursor-pointer ${className}`}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`,
        border: on ? '1px solid transparent' : '1px solid transparent',
        background: on
          ? LiminalColorEngine.BRAND_PRIMARY.hex
          : offRim.cssBackground,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.25 : 1,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: 0,
        outline: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: on ? '23px' : '3px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: on ? LiminalColorEngine.BRAND_PRIMARY.onColor : 'rgba(255, 255, 255, 0.40)',
          boxShadow: on ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </button>
  );
}
