import React from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  meta?: string;
  icon?: React.ReactNode;
  surfaceLevel?: number;
  className?: string;
}

export function Stat({
  label,
  value,
  change,
  changeType = 'neutral',
  meta,
  icon,
  surfaceLevel = 2,
  className = '',
}: StatProps) {
  const statStyle = getLiminalStyle({
    surfaceLevel,
    isContainer: true,
  });

  const changeColors = {
    positive: LiminalColorEngine.SEMANTICS.SUCCESS.text,
    negative: LiminalColorEngine.SEMANTICS.DANGER.text,
    neutral: SpecEngine.getTextStyle('tertiary', surfaceLevel).color,
  };

  return (
    <div
      className={`font-mono p-4 space-y-2 transition-all ${className}`}
      style={{
        ...statStyle.style,
        borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
      }}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span
          className="uppercase tracking-wider truncate"
          style={getTextStyle('tertiary', surfaceLevel)}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: SpecEngine.getTextStyle('tertiary', surfaceLevel).color }}>
            {icon}
          </span>
        )}
      </div>

      <div
        className="font-bold tracking-tight text-xl sm:text-2xl"
        style={{ color: SpecEngine.getTextStyle('primary', surfaceLevel).color }}
      >
        {value}
      </div>

      {(change || meta) && (
        <div className="flex items-center gap-1.5 text-[10px] pt-0.5">
          {change && (
            <span
              className="inline-flex items-center gap-0.5 font-semibold"
              style={{ color: changeColors[changeType] }}
            >
              {changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
              {changeType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
              {change}
            </span>
          )}
          {meta && (
            <span style={getTextStyle('quaternary', surfaceLevel)}>
              {meta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
