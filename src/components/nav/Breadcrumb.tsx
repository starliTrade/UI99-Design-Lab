import React from 'react';
import { SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 font-mono text-xs ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = Boolean(item.onClick && !isLast);

        return (
          <React.Fragment key={item.id}>
            {isClickable ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:underline transition-all cursor-pointer"
                style={getTextStyle('secondary', 1)}
              >
                {item.label}
              </button>
            ) : (
              <span
                style={
                  isLast || item.active
                    ? { color: SpecEngine.getTextStyle('primary', 1).color, fontWeight: 600 }
                    : getTextStyle('secondary', 1)
                }
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight
                className="w-3 h-3 shrink-0"
                style={{ color: SpecEngine.getTextStyle('quaternary', 1).color }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
