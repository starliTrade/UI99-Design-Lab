import React, { Children, cloneElement, isValidElement } from 'react';
import type { CSSProperties, ReactNode, ReactElement } from 'react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export function AvatarGroup({
  children,
  max,
  size = 'md',
  className = '',
  style: customStyle = {},
}: AvatarGroupProps) {
  const allChildren = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const total = allChildren.length;

  const showOverflow = max !== undefined && total > max;
  const visibleChildren = showOverflow ? allChildren.slice(0, max) : allChildren;
  const overflowCount = total - (max ?? total);

  const canvasBorderColor = getLadderColor(0); // Canvas #060709 separator

  const sizes: Record<'sm' | 'md' | 'lg', { px: number; fs: number; overlap: number }> = {
    sm: { px: 24, fs: 10, overlap: -6 },
    md: { px: 32, fs: 11, overlap: -8 },
    lg: { px: 44, fs: 13, overlap: -10 },
  };

  const { px, fs, overlap } = sizes[size];

  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    direction: 'ltr', // Strict LTR for uniform visual overlap
    boxSizing: 'border-box',
    ...customStyle,
  };

  const counterAvatarStyle: CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    borderRadius: '50%',
    background: getLadderColor(3), // Surface 3 #0D0E12
    color: getTextStyle('secondary', 3).color,
    border: `2px solid ${canvasBorderColor}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fs}px`,
    fontWeight: 600,
    fontFamily: 'inherit',
    flexShrink: 0,
    userSelect: 'none',
    boxSizing: 'border-box',
    marginRight: 0,
  };

  return (
    <div className={className} style={groupStyle}>
      {visibleChildren.map((child, index) => {
        const isLastInVisible = index === visibleChildren.length - 1 && !showOverflow;
        const childElement = child as React.ReactElement<any>;

        return cloneElement(childElement, {
          key: childElement.key || index,
          size,
          style: {
            border: `2px solid ${canvasBorderColor}`,
            marginRight: isLastInVisible ? 0 : `${overlap}px`,
            ...childElement.props?.style,
          },
        });
      })}

      {showOverflow && (
        <span style={counterAvatarStyle} title={`${overflowCount} more`}>
          +{overflowCount}
        </span>
      )}
    </div>
  );
}

export default AvatarGroup;
