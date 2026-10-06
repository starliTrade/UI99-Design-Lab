import React from 'react';
import { getLiminalStyle, SpecEngine } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  fullWidth = true,
  size = 'md',
  className = '',
}: TabsProps) {
  const containerRadius = LiminalLayoutEngine.RADIUS.panel; // 20px
  const innerRadius = LiminalLayoutEngine.getConcentricRadius(containerRadius, 4);

  const containerStyle = getLiminalStyle({
    surfaceLevel: 1,
    isContainer: true,
  });

  return (
    <div
      role="tablist"
      className={`p-1 flex font-mono transition-all ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}
      style={{
        ...containerStyle.style,
        borderRadius: `${containerRadius}px`,
      }}
    >
      {items.map((item) => {
        const isSelected = item.id === value;
        const activeTabStyle = isSelected
          ? getLiminalStyle({ surfaceLevel: 3, interactive: true })
          : null;

        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(item.id)}
            className={`flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium select-none ${
              fullWidth ? 'flex-1' : 'px-4'
            } ${size === 'sm' ? 'py-1.5 text-[11px]' : 'py-2 text-xs'}`}
            style={{
              background: isSelected ? activeTabStyle?.style.background : 'transparent',
              border: isSelected ? activeTabStyle?.style.border : 'none',
              boxShadow: isSelected ? activeTabStyle?.style.boxShadow : 'none',
              color: isSelected
                ? SpecEngine.getTextStyle('primary', 3).color
                : SpecEngine.getTextStyle('secondary', 1).color,
              borderRadius: `${innerRadius}px`,
            }}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && <span className="ml-1">{item.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
