import React, { useEffect } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: SheetProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sheetStyle = getLiminalStyle({
    surfaceLevel: 5,
    isFloating: true,
    elevation: 3,
    isContainer: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-md font-mono p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
        style={{
          ...sheetStyle.style,
          borderTopLeftRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
          borderTopRightRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
          borderBottomLeftRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
          borderBottomRightRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        {/* Handle for touch cue on mobile */}
        <div
          className="w-10 h-1 rounded-full mx-auto sm:hidden -mt-1 mb-2 bg-white/20"
        />

        <div className="flex items-start justify-between pb-2 border-b border-white/5">
          <div>
            {title && (
              <h3
                className="text-sm sm:text-base font-bold tracking-tight"
                style={{ color: SpecEngine.getTextStyle('primary', 5).color }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-xs mt-0.5"
                style={getTextStyle('tertiary', 5)}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md transition-opacity hover:opacity-100 opacity-60 cursor-pointer"
            style={{ color: SpecEngine.getTextStyle('secondary', 5).color }}
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs leading-relaxed" style={{ color: SpecEngine.getTextStyle('secondary', 5).color }}>
          {children}
        </div>

        {footer && <div className="pt-2 flex justify-end gap-2 border-t border-white/5">{footer}</div>}
      </div>
    </div>
  );
}
