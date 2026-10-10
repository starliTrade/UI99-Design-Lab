import React, { useState } from 'react';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { Checkbox } from '../../inputs/Checkbox';

export interface TableColumn {
  key: string;
  title?: string;
  header?: string;
  render?: (item: any, index?: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
}

export interface TableProps {
  columns?: TableColumn[];
  data?: Array<Record<string, any>>;
  selectable?: boolean;
  keyExtractor?: (item: any) => string | number;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  selectedRows?: number[];
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Table({
  columns,
  data,
  selectable = false,
  keyExtractor,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  children,
  className = '',
  style: customStyle = {},
}: TableProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const surfaceLevel = 2;
  const limStyle = getLiminalStyle({
    surfaceLevel,
    isContainer: true,
  });

  const rimSideColor = getLadderColor(1.5);
  const selectedRim = getDirectionalRim(2, 1, false);

  const containerStyle: CSSProperties = {
    width: '100%',
    overflowX: 'auto',
    boxSizing: 'border-box',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '12px',
    background: limStyle.style.background,
    border: limStyle.style.border,
    boxShadow: limStyle.style.boxShadow,
    ...customStyle,
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    textAlign: 'right',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  // If composite children are passed directly (Phase 2 Data Table architecture)
  if (!columns && !data) {
    return (
      <div className={className} style={containerStyle}>
        <table role="table" style={tableStyle}>
          {children}
        </table>
      </div>
    );
  }

  // Legacy fallback renderer for existing pages using columns & data props
  const allSelected = Boolean(data && data.length > 0 && selectedRows.length === data.length);

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleSelectRow = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    const isCurrentlySelected = selectedRows.includes(index);
    onSelectRow?.(index, !isCurrentlySelected);
  };

  const SPACING = 12;
  const TYPOGRAPHY_FS = 13;
  const TYPOGRAPHY_LH = 1.5;

  return (
    <div className={className} style={containerStyle}>
      <table role="table" style={tableStyle}>
        <thead>
          <tr role="row">
            {selectable && (
              <th
                scope="col"
                style={{
                  width: '44px',
                  padding: `${SPACING}px ${SPACING}px`,
                  borderBottom: `1px solid ${rimSideColor}`,
                  textAlign: 'center',
                }}
              >
                <Checkbox
                  checked={allSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}

            {columns?.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  width: col.width,
                  padding: `${SPACING}px ${LiminalLayoutEngine.SPACING[4]}px`,
                  fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[1].fs}px`,
                  letterSpacing: '+0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: getTextStyle('tertiary', 1).color,
                  borderBottom: `1px solid ${rimSideColor}`,
                  textAlign: col.align || 'right',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {col.title || col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data?.map((row, index) => {
            const isSelected = selectedRows.includes(index);
            const isHovered = hoveredIndex === index;

            let rowBg = 'transparent';
            if (isSelected) {
              rowBg = selectedRim ? selectedRim.cssBackground : getLadderColor(2);
            } else if (isHovered) {
              rowBg = rimSideColor;
            }

            return (
              <tr
                key={keyExtractor ? keyExtractor(row) : (row.id || index)}
                role="row"
                aria-selected={isSelected}
                onClick={() => onRowClick?.(row, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  background: rowBg,
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: LiminalMotionEngine.getTransition('background', 'fast'),
                  userSelect: 'none',
                }}
              >
                {selectable && (
                  <td
                    style={{
                      padding: `${SPACING}px ${SPACING}px`,
                      borderBottom: `1px solid ${rimSideColor}`,
                      textAlign: 'center',
                    }}
                    onClick={(e) => handleSelectRow(e, index)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => {}}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}

                {columns?.map((col) => {
                  const isPrimaryCol = col.key === 'name' || col.key === 'title';
                  const cellValue = row[col.key];

                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: `${SPACING}px 16px`,
                        fontSize: `${TYPOGRAPHY_FS}px`,
                        lineHeight: TYPOGRAPHY_LH,
                        color: isPrimaryCol
                          ? getTextStyle('primary', 1).color
                          : getTextStyle('secondary', 1).color,
                        fontWeight: isPrimaryCol ? 500 : 400,
                        borderBottom: `1px solid ${rimSideColor}`,
                        textAlign: col.align || 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.render ? col.render(row, index) : cellValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
