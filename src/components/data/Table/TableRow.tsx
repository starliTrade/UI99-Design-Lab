import React, { useState } from 'react';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';
import { getLadderColor, getDirectionalRim } from '../../../engine/spec-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveBorder, resolveSurface } from '../../../engine/liminal-surface';

export interface TableRowProps {
  children: ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick?: (e: MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
  style?: CSSProperties;
}

export function TableRow({
  children,
  isSelected = false,
  onClick,
  className = '',
  style: customStyle = {},
}: TableRowProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  // A row separator: a seam inside the work surface.
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' });
  const selectedRim = getDirectionalRim(2, 1, false);

  let rowBg = 'transparent';
  if (isSelected) {
    rowBg = selectedRim ? selectedRim.cssBackground : resolveSurface({ role: 'work', state: 'hover' }).background;
  } else if (isHovered) {
    rowBg = resolveSurface({ role: 'work', state: 'hover' }).background;
  }

  const rowStyle: CSSProperties = {
    background: rowBg,
    cursor: onClick ? 'pointer' : 'default',
    transition: reducedMotion ? 'none' : LiminalMotionEngine.getTransition('background', 'fast'),
    boxSizing: 'border-box',
    borderBottom: `1px solid ${rimSideColor}`,
    userSelect: 'none',
    ...customStyle,
  };

  return (
    <tr
      role="row"
      aria-selected={isSelected}
      className={className}
      style={rowStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </tr>
  );
}

export default TableRow;
