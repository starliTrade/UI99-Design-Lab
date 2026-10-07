import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import { getDirectionalRim, getTextStyle, SHADOWS, LADDER } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { Divider } from '../Divider';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  style: customStyle = {},
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
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

    // Focus first focusable element inside modal
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
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
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusables = modalRef.current.querySelectorAll<HTMLElement>(
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

  const sizeWidths: Record<'sm' | 'md' | 'lg', number> = {
    sm: 360,
    md: 480,
    lg: 640,
  };

  // Surface 3 with Rim 2 and Sub-Canvas Penumbra SHADOWS[3]
  const rim = getDirectionalRim(3, 2, false);

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 4, 6, 0.60)', // Sub-canvas C-1 veil
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${SPACING[4]}px`,
    boxSizing: 'border-box',
    animation: 'liminalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const modalContainerStyle: CSSProperties = {
    position: 'relative',
    width: `${sizeWidths[size]}px`,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 64px)',
    background: rim ? rim.cssBackground : LADDER[3],
    border: rim ? '1px solid transparent' : 'none',
    borderRadius: `${RADIUS.panel}px`, // 20px
    boxShadow: SHADOWS[3], // Authentic dual-layer penumbra
    padding: `${SPACING[5]}px`, // 24px
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    outline: 'none',
    overflowY: 'auto',
    animation: 'liminalModalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[5].fs}px`, // 23px
    lineHeight: TYPOGRAPHY[5].lh,
    letterSpacing: TYPOGRAPHY[5].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 3).color,
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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'liminal-modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={className}
        style={modalContainerStyle}
      >
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
            <h2 id="liminal-modal-title" style={titleStyle}>
              {title}
            </h2>
          ) : (
            <div />
          )}

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: getTextStyle('tertiary', 3).color,
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

        {/* Body Content */}
        <div
          style={{
            flex: 1,
            color: getTextStyle('secondary', 3).color,
            fontSize: `${TYPOGRAPHY[3].fs}px`,
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <>
            <Divider spacing="sm" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: `${SPACING[2]}px`,
              }}
            >
              {actions}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes liminalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes liminalModalSlide {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default Modal;
