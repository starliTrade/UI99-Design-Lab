import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLadderColor } from '../../../engine/spec-engine';
import { resolveBorder } from '../../../engine/liminal-surface';

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function TableHeader({
  children,
  className = '',
  style: customStyle = {},
}: TableHeaderProps) {
  // A row separator: a seam inside the work surface.
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' });

  const headerStyle: CSSProperties = {
    borderBottom: `1px solid ${rimSideColor}`,
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <thead className={className} style={headerStyle}>
      {children}
    </thead>
  );
}

export default TableHeader;
