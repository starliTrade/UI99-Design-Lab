import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveBorder } from '../../../engine/liminal-surface';

export interface TableCellProps {
  children?: ReactNode;
  isPrimary?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
  style?: CSSProperties;
  onClick?: (e?: any) => void;
}

export function TableCell({
  children,
  isPrimary = false,
  align = 'right',
  className = '',
  style: customStyle = {},
  onClick,
}: TableCellProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  // A row separator: a seam inside the work surface.
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' });

  const tdStyle: CSSProperties = {
    padding: `${SPACING[3]}px ${SPACING[4]}px`,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    color: isPrimary
      ? getTextStyle('primary', 1).color
      : getTextStyle('secondary', 1).color,
    fontWeight: isPrimary ? 500 : 400,
    borderBottom: `1px solid ${rimSideColor}`,
    textAlign: align,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <td role="cell" className={className} style={tdStyle} onClick={onClick}>
      {children}
    </td>
  );
}

export default TableCell;
