import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react';
import { Button } from '../../atoms/Button';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import {
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  style?: CSSProperties;
}

export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'left-ellipsis' | 'right-ellipsis')[] {
  const totalPageNumbers = siblingCount + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'right-ellipsis', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [1, 'left-ellipsis', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'left-ellipsis', ...middleRange, 'right-ellipsis', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
  style: customStyle = {},
}: PaginationProps) {
  const reducedMotion = useReducedMotion();
  const SPACING = LiminalLayoutEngine.SPACING;

  const range = generatePaginationRange(currentPage, totalPages, siblingCount);

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: `${SPACING[1]}px`, // 4px
    userSelect: 'none',
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <nav role="navigation" aria-label="Pagination" className={className} style={containerStyle}>
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        ariaLabel="Go to previous page"
        icon={<LiminalIcon icon={CaretLeft} size="sm" weight="bold" />}
      >
        Prev
      </Button>

      {/* Page Items */}
      {range.map((pageNumber, idx) => {
        if (pageNumber === 'left-ellipsis' || pageNumber === 'right-ellipsis') {
          return (
            <span
              key={`ellipsis-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                color: getTextStyle('tertiary', 1).color,
              }}
              aria-hidden="true"
            >
              <LiminalIcon icon={DotsThree} size="sm" weight="bold" />
            </span>
          );
        }

        const isCurrent = pageNumber === currentPage;
        return (
          <PageButton
            key={`page-${pageNumber}`}
            page={pageNumber as number}
            isCurrent={isCurrent}
            onClick={() => onPageChange(pageNumber as number)}
            reducedMotion={reducedMotion}
          />
        );
      })}

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        ariaLabel="Go to next page"
        iconRight={<LiminalIcon icon={CaretRight} size="sm" weight="bold" />}
      >
        Next
      </Button>
    </nav>
  );
}

interface PageButtonProps {
  page: number;
  isCurrent: boolean;
  onClick: () => void;
  reducedMotion: boolean;
}

function PageButton({ page, isCurrent, onClick, reducedMotion }: PageButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  let bg = 'transparent';
  if (isCurrent) {
    bg = getLadderColor(3);
  } else if (isHovered) {
    bg = getLadderColor(2.5);
  }

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    padding: '0 8px',
    borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
    background: bg,
    border: isCurrent ? `1px solid ${getLadderColor(4)}` : '1px solid transparent',
    color: isCurrent ? getTextStyle('primary', 1).color : getTextStyle('secondary', 1).color,
    fontWeight: isCurrent ? 600 : 400,
    fontSize: `${LiminalLayoutEngine.TYPOGRAPHY[2].fs}px`,
    cursor: 'pointer',
    outline: 'none',
    transition: reducedMotion
      ? 'none'
      : `${LiminalMotionEngine.getTransition('background', 'fast')}, ${LiminalMotionEngine.getTransition('color', 'fast')}`,
  };

    return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={`Page ${page}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {page}
    </button>
  );
}

export default Pagination;
