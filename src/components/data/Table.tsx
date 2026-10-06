import React from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  className = '',
}: TableProps<T>) {
  const tableContainer = getLiminalStyle({
    surfaceLevel: 1,
    isContainer: true,
  });

  return (
    <div
      className={`font-mono overflow-x-auto transition-all ${className}`}
      style={{
        ...tableContainer.style,
        borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
      }}
    >
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr
            style={{
              backgroundColor: SpecEngine.LADDER[2],
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider select-none"
                style={{
                  ...getTextStyle('tertiary', 2),
                  textAlign: col.align || 'left',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 whitespace-nowrap text-xs"
                  style={{
                    color: SpecEngine.getTextStyle('primary', 1).color,
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.render
                    ? col.render(item)
                    : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
