import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { X, XCircle, Funnel } from '@phosphor-icons/react';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface, resolveInteractionVars } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

export interface FilterBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onClearAll: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function FilterBar({
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  children,
  className = '',
  style: customStyle = {},
}: FilterBarProps) {
  const host = useHostSurface();
  const reducedMotion = useReducedMotion();
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;

  // A structural surface: the level of the frame around the work, with a quiet
  // edge, and it does not answer the pointer.
  const baseStyle = resolveSurface({ role: 'chrome', interactive: false }).style;

  const containerStyle: CSSProperties = {
    ...baseStyle,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    padding: `${SPACING[3]}px`,
    borderRadius: `${RADIUS.container}px`,
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <div className={className} style={containerStyle} role="region" aria-label="Filter Bar">
      {/* Filter Inputs / Children */}
      {children && (
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[200px]">
          {children}
        </div>
      )}

      {/* Active Filters and Clear All */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 ms-auto">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: getTextStyle('tertiary', 1).color }}>
            <LiminalIcon icon={Funnel} size="xs" weight="bold" />
            <span>Active:</span>
          </div>

          {activeFilters.map((filter) => (
            <Badge key={filter.id} semantic="info">
              <span className="flex items-center gap-1.5">
                <span>
                  {filter.label}: <strong>{filter.value}</strong>
                </span>
                <RemoveFilterButton
                  label={filter.label}
                  onClick={() => onRemoveFilter(filter.id)}
                  reducedMotion={reducedMotion}
                />
              </span>
            </Badge>
          ))}

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAll}
            ariaLabel="Clear all filters"
            icon={<LiminalIcon icon={XCircle} size="sm" weight="bold" />}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}

interface RemoveFilterButtonProps {
  label: string;
  onClick: () => void;
  reducedMotion: boolean;
}

function RemoveFilterButton({ label, onClick, reducedMotion }: RemoveFilterButtonProps) {
  const host = useHostSurface();
  // The hover state is CSS's job now — no setState, no re-render on mouse move.
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Flat on the host at rest, lifted by the layer on hover, dropped back on
    // press. The six variables come from the one producer.
    ...resolveInteractionVars({ role: 'control', on: host, idle: 'transparent' }),
    border: 'none',
    borderRadius: '50%',
    width: `${LiminalLayoutEngine.SPACING[4]}px`,
    height: `${LiminalLayoutEngine.SPACING[4]}px`,
    padding: 0,
    cursor: 'pointer',
    color: 'inherit',
    transition: reducedMotion ? 'none' : LiminalMotionEngine.getTransition('background', 'fast'),
  } as CSSProperties;

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`Remove filter ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      data-liminal-surface=""
      style={style}
    >
      <LiminalIcon icon={X} size="xs" weight="bold" />
    </button>
  );
}

export default FilterBar;
