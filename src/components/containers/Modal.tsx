import React, { useEffect } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { X } from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-md',
}: ModalProps) {
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

  const modalStyle = getLiminalStyle({
    surfaceLevel: 5,
    isFloating: true,
    elevation: 3,
    isContainer: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} font-mono p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200`}
        style={{
          ...modalStyle.style,
          borderRadius: `${LiminalLayoutEngine.RADIUS.panel}px`,
        }}
      >
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
            {description && (
              <p
                className="text-xs mt-1"
                style={getTextStyle('tertiary', 5)}
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md transition-opacity hover:opacity-100 opacity-60 cursor-pointer"
            style={{ color: SpecEngine.getTextStyle('secondary', 5).color }}
            aria-label="Close dialog"
          >
            <LiminalIcon icon={X} size="sm" weight="light" />
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
