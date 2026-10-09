import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function BreadcrumbLink({ item }: { item: BreadcrumbItem }) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const style: CSSProperties = {
    color: isHovered
      ? getTextStyle('secondary', 1).color
      : getTextStyle('tertiary', 1).color,
    textDecoration: 'none',
    transition: LiminalMotionEngine.getTransition('color', 'fast'),
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit',
  };

  if (item.onClick) {
    return (
      <button
        type="button"
        style={style}
        onClick={item.onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.label}
      </button>
    );
  }

  return (
    <a
      href={item.href || '#'}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.label}
    </a>
  );
}

export function Breadcrumb({
  items = [],
  separator = '/',
  className = '',
  style: customStyle = {},
}: BreadcrumbProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const navStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    ...customStyle,
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    listStyle: 'none',
    margin: 0,
    padding: 0,
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontFamily: 'inherit',
  };

  const separatorStyle: CSSProperties = {
    color: getTextStyle('quaternary', 1).color,
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const activeStyle: CSSProperties = {
    color: getTextStyle('primary', 1).color,
    fontWeight: 500,
  };

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <nav aria-label="Breadcrumb" className={className} style={navStyle}>
      <ol role="list" style={listStyle}>
        {safeItems.map((item, index) => {
          const isLast = index === safeItems.length - 1;
          const isActive = item.active || isLast;
          // Guaranteed unique and defined key
          const itemKey = item.id || `${item.label}-${index}`;

          return (
            <li
              key={itemKey}
              style={{ display: 'inline-flex', alignItems: 'center', gap: `${SPACING[2]}px` }}
            >
              {isActive ? (
                <span style={activeStyle} aria-current="page">
                  {item.label}
                </span>
              ) : item.href || item.onClick ? (
                <BreadcrumbLink item={item} />
              ) : (
                <span style={{ color: getTextStyle('tertiary', 1).color }}>
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span aria-hidden="true" style={separatorStyle}>
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
