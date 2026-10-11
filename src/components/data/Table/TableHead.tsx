import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowsDownUp, CaretUp, CaretDown } from '@phosphor-icons/react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveBorder } from '../../../engine/liminal-surface';

export interface TableHeadProps {
  children?: ReactNode;
  sortDirection?: 'asc' | 'desc' | 'none';
  onSort?: () => void;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  className?: string;
  style?: CSSProperties;
}

export function TableHead({
  children,
  sortDirection = 'none',
  onSort,
  align = 'right',
  width,
  className = '',
  style: customStyle = {},
}: TableHeadProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  // A row separator: a seam inside the work surface.
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' });

  const isSortable = typeof onSort === 'function';

  const thStyle: CSSProperties = {
    width,
    padding: `${SPACING[3]}px ${SPACING[4]}px`,
    fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
    lineHeight: TYPOGRAPHY[1].lh,
    letterSpacing: '+0.06em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: sortDirection !== 'none' ? getTextStyle('primary', 1).color : getTextStyle('tertiary', 1).color,
    borderBottom: `1px solid ${rimSideColor}`,
    textAlign: align,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    boxSizing: 'border-box',
    background: 'transparent',
    ...customStyle,
  };

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${SPACING[1]}px`,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    color: 'inherit',
    width: '100%',
    justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
  };

  const iconTransition = reducedMotion
    ? 'none'
    : LiminalMotionEngine.getTransition('opacity', 'fast');

  const renderSortIcon = () => {
    if (!isSortable) return null;

    if (sortDirection === 'asc') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: getTextStyle('primary', 1).color,
            transition: iconTransition,
          }}
          aria-hidden="true"
        >
          <LiminalIcon icon={CaretUp} size="xs" weight="bold" />
        </span>
      );
    }
    if (sortDirection === 'desc') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: getTextStyle('primary', 1).color,
            transition: iconTransition,
          }}
          aria-hidden="true"
        >
          <LiminalIcon icon={CaretDown} size="xs" weight="bold" />
        </span>
      );
    }
    // 'none'
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: getTextStyle('tertiary', 1).color,
          opacity: isHovered ? 1 : 0,
          transition: iconTransition,
        }}
        aria-hidden="true"
      >
        <LiminalIcon icon={ArrowsDownUp} size="xs" weight="light" />
      </span>
    );
  };

  const ariaSortValue =
    sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none';

  if (isSortable) {
    return (
      <th
        role="columnheader"
        aria-sort={ariaSortValue}
        className={className}
        style={thStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button type="button" onClick={onSort} style={buttonStyle}>
          {align === 'left' && renderSortIcon()}
          <span>{children}</span>
          {align !== 'left' && renderSortIcon()}
        </button>
      </th>
    );
  }

  return (
    <th role="columnheader" className={className} style={thStyle}>
      {children}
    </th>
  );
}

export default TableHead;
