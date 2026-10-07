import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import { getDirectionalRim, getTextStyle, SHADOWS, LADDER } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { Divider } from '../Divider';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'bottom' | 'right';
  size?: 'sm' | 'md' | 'lg';
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  position = 'bottom',
  size = 'md',
  showHandle = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  style: customStyle = {},
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Body scroll lock & focus trap setup
  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      if (sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          sheetRef.current.focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  // Focus trap on Tab
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !sheetRef.current) return;

    const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const rightWidths: Record<'sm' | 'md' | 'lg', number> = {
    sm: 320,
    md: 400,
    lg: 480,
  };

  // Surface 2 with Rim 2 and Sub-Canvas Penumbra SHADOWS[3]
  const rim = getDirectionalRim(2, 2, false);

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 4, 6, 0.60)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    zIndex: 100,
    boxSizing: 'border-box',
    animation: 'liminalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const isBottom = position === 'bottom';

  const sheetContainerStyle: CSSProperties = {
    position: 'fixed',
    background: rim ? rim.cssBackground : LADDER[2],
    border: rim ? '1px solid transparent' : 'none',
    boxShadow: SHADOWS[3],
    boxSizing: 'border-box',
    outline: 'none',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    ...(isBottom
      ? {
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxHeight: '80vh',
          borderRadius: `${RADIUS.panel}px ${RADIUS.panel}px 0 0`,
          padding: `${SPACING[5]}px`,
          animation: 'liminalSheetSlideBottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      : {
          top: 0,
          right: 0,
          bottom: 0,
          width: `${rightWidths[size]}px`,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '100vh',
          borderRadius: `${RADIUS.panel}px 0 0 ${RADIUS.panel}px`,
          padding: `${SPACING[5]}px`,
          animation: 'liminalSheetSlideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }),
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[4].fs}px`, // 19px
    lineHeight: TYPOGRAPHY[4].lh,
    letterSpacing: TYPOGRAPHY[4].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 2).color,
    margin: 0,
  };

  return createPortal(
    <div
      style={backdropStyle}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'liminal-sheet-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={className}
        style={sheetContainerStyle}
      >
        {/* Handle for Bottom Sheet */}
        {isBottom && showHandle && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: `${SPACING[3]}px`,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.12)',
              }}
            />
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${SPACING[3]}px`,
          }}
        >
          {title ? (
            <h2 id="liminal-sheet-title" style={titleStyle}>
              {title}
            </h2>
          ) : (
            <div />
          )}

          <button
            type="button"
            aria-label="Close sheet"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: getTextStyle('tertiary', 2).color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: `${RADIUS.chip}px`,
              transition: 'color 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {title && <Divider spacing="sm" />}

        {/* Content */}
        <div
          style={{
            flex: 1,
            color: getTextStyle('secondary', 2).color,
            fontSize: `${TYPOGRAPHY[3].fs}px`,
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes liminalSheetSlideBottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes liminalSheetSlideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default Sheet;
