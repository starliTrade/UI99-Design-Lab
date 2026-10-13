import React from 'react';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';
import { getLadderColor, getDirectionalRim } from '../../../engine/spec-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveBorder, resolveSurface, resolveInteractionVars } from '../../../engine/liminal-surface';

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
  const reducedMotion = useReducedMotion();

  // A row separator: a seam inside the work surface.
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' });
  const selectedRim = getDirectionalRim(2, 1, false);

  let rowBg = 'transparent';
  if (isSelected) {
    rowBg = selectedRim ? selectedRim.cssBackground : resolveSurface({ role: 'work', state: 'hover' }).background;
  }
  const rowHoverBg = resolveSurface({ role: 'work', state: 'hover' }).background;

  const rowStyle: CSSProperties = {
    // A row is a seam in the work surface, not a control that lifts off it, so
    // a pressed row keeps the hover fill rather than sinking below the rest.
    ...resolveInteractionVars({ role: 'work', idle: rowBg, active: rowHoverBg }),
    // NO `background` here. An inline style beats a CSS rule, so this line was
    // silently cancelling the layer's :hover — the row has had no hover state
    // since the Step 2.1 migration, and nothing caught it because the property
    // was set, just by the wrong owner.
    cursor: onClick ? 'pointer' : 'default',
    transition: reducedMotion ? 'none' : LiminalMotionEngine.getTransition('background', 'fast'),
    boxSizing: 'border-box',
    borderBottom: `1px solid ${rimSideColor}`,
    userSelect: 'none',
    ...customStyle,
  } as CSSProperties;

  return (
    <tr
      role="row"
      aria-selected={isSelected}
      className={className}
      style={rowStyle}
      onClick={onClick}
      data-liminal-surface=""
    >
      {children}
    </tr>
  );
}

export default TableRow;
