import React, { useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import {
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { Checkbox } from '../../inputs/Checkbox';

export interface TableColumn {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
}

export interface TableProps {
  columns: TableColumn[];
  data: Array<Record<string, any>>;
  selectable?: boolean;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  selectedRows?: number[];
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export function Table({
  columns,
  data,
  selectable = false,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  className = '',
  style: customStyle = {},
}: TableProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const rimSideColor = getLadderColor(1.5); // #090A0D half-step rimSide
  const selectedRim = getDirectionalRim(2, 1, false);

  const allSelected = data.length > 0 && selectedRows.length === data.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleSelectRow = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    const isCurrentlySelected = selectedRows.includes(index);
    onSelectRow?.(index, !isCurrentlySelected);
  };

  return (
    <div
      className={className}
      style={{
        width: '100%',
        overflowX: 'auto',
        boxSizing: 'border-box',
        WebkitOverflowScrolling: 'touch',
        ...customStyle,
      }}
    >
      <table
        role="table"
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          textAlign: 'right',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      >
        <thead>
          <tr role="row">
            {selectable && (
              <th
                scope="col"
                style={{
                  width: '44px',
                  padding: `${SPACING[3]}px ${SPACING[3]}px`,
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

            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  width: col.width,
                  padding: `${SPACING[3]}px ${SPACING[4]}px`,
                  fontSize: `${TYPOGRAPHY[1].fs}px`, // 11px
                  lineHeight: TYPOGRAPHY[1].lh,
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
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const isSelected = selectedRows.includes(index);
            const isHovered = hoveredIndex === index;

            let rowBg = 'transparent';
            if (isSelected) {
              rowBg = selectedRim ? selectedRim.cssBackground : getLadderColor(2);
            } else if (isHovered) {
              rowBg = rimSideColor; // S1.5 half-step #090A0D
            }

            return (
              <tr
                key={row.id || index}
                role="row"
                aria-selected={isSelected}
                onClick={() => onRowClick?.(row, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  background: rowBg,
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                  userSelect: 'none',
                }}
              >
                {selectable && (
                  <td
                    style={{
                      padding: `${SPACING[3]}px ${SPACING[3]}px`,
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

                {columns.map((col) => {
                  const isPrimaryCol = col.key === 'name' || col.key === 'title';
                  const cellValue = row[col.key];

                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: `${SPACING[3]}px ${SPACING[4]}px`,
                        fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
                        lineHeight: TYPOGRAPHY[2].lh,
                        color: isPrimaryCol
                          ? getTextStyle('primary', 1).color
                          : getTextStyle('secondary', 1).color,
                        fontWeight: isPrimaryCol ? 500 : 400,
                        borderBottom: `1px solid ${rimSideColor}`,
                        textAlign: col.align || 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cellValue}
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
