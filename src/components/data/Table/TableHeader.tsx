import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getLadderColor } from '../../../engine/spec-engine';

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
  const rimSideColor = getLadderColor(1.5);

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
