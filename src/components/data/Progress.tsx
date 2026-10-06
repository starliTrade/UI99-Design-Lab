import React from 'react';
import { SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  semantic?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  height?: number;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  semantic = 'brand',
  height = 6,
  className = '',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const fillColors = {
    brand: LiminalColorEngine.BRAND_PRIMARY.hex,
    success: LiminalColorEngine.SEMANTICS.SUCCESS.solid,
    warning: LiminalColorEngine.SEMANTICS.WARNING.solid,
    danger: LiminalColorEngine.SEMANTICS.DANGER.solid,
    info: LiminalColorEngine.SEMANTICS.INFO.solid,
  };

  return (
    <div className={`font-mono space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[11px]">
          {label && (
            <span style={getTextStyle('tertiary', 1)}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className="w-full overflow-hidden transition-all"
        style={{
          height: `${height}px`,
          backgroundColor: SpecEngine.LADDER[1],
          borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`,
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColors[semantic],
            borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`,
          }}
        />
      </div>
    </div>
  );
}
