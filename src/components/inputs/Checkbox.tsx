import React, { useState } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const state = disabled ? 'disabled' : isFocused ? 'focus' : isHovered ? 'hover' : 'idle';

  const boxStyle = getLiminalStyle({
    surfaceLevel: 2,
    interactive: true,
    state,
  });

  const brand = LiminalColorEngine.BRAND_PRIMARY;

  return (
    <label
      className={`inline-flex items-start gap-2.5 font-mono select-none ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      } ${className}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <div className="relative pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => !disabled && setIsFocused(false)}
          className="sr-only"
        />

        <div
          className="w-5 h-5 flex items-center justify-center transition-all duration-150"
          style={{
            borderRadius: `${LiminalLayoutEngine.RADIUS.chip}px`,
            ...(checked
              ? {
                  backgroundColor: brand.hex,
                  border: '1px solid transparent',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  outline: isFocused ? '2px solid rgba(233,236,242,0.45)' : 'none',
                  outlineOffset: '2px',
                }
              : {
                  ...boxStyle.style,
                }),
          }}
        >
          {checked && (
            <Check
              className="w-3.5 h-3.5"
              strokeWidth={3}
              style={{ color: brand.onColor }}
            />
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className="text-xs leading-tight"
              style={{
                color: SpecEngine.getTextStyle(checked ? 'primary' : 'secondary', 1).color,
                fontWeight: checked ? 500 : 400,
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              className="text-[10px] leading-normal mt-0.5"
              style={getTextStyle('quaternary', 1)}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
