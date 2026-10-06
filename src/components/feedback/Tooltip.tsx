import React, { useState, useRef } from 'react';
import { getLiminalStyle, SpecEngine } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 150);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const tipStyle = getLiminalStyle({
    surfaceLevel: 4,
    isFloating: true,
    elevation: 1,
    isContainer: true,
  });

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 font-mono text-[10px] whitespace-nowrap pointer-events-none animate-in fade-in-50 zoom-in-95 duration-100 ${
            position === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
          }`}
          style={{
            ...tipStyle.style,
            borderRadius: `${LiminalLayoutEngine.RADIUS.chip}px`,
            color: SpecEngine.getTextStyle('primary', 4).color,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
