import React, { useRef, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';
import { getDirectionalRim, getTextStyle, SHADOWS, LADDER, VEIL } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import {
  useScrollLock,
  useEscapeKey,
  useFocusTrap,
  useClickOutside,
  useReducedMotion,
} from '../../../engine/liminal-hooks';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { Divider } from '../Divider';
import { X } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  maxWidth?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  footer,
  size = 'md',
  maxWidth,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  style: customStyle = {},
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  // A fixed id meant two modals on one page produced duplicate ids, and
  // `aria-labelledby` pointed at whichever the browser found first.
  const titleId = `${useId()}-title`;

  const isModalOpen = open ?? isOpen ?? false;

  // `aria-modal` tells assistive technology the rest of the page is inert. It
  // does not make it inert: the keyboard can still tab into the background and
  // a screen reader's virtual cursor can still read it. The `inert` attribute
  // does both, and it is what the ARIA authoring practices ask for.
  useEffect(() => {
    if (!isModalOpen) return;
    const root = document.getElementById('root') ?? document.body;
    const changed: Element[] = [];
    for (const child of Array.from(root.children)) {
      if (child.contains(modalRef.current) || child === modalRef.current?.parentElement) continue;
      if (child.hasAttribute('inert')) continue;
      child.setAttribute('inert', '');
      changed.push(child);
    }
    return () => changed.forEach((c) => c.removeAttribute('inert'));
  }, [isModalOpen]);
  const actionContent = actions ?? footer;
  const reduced = useReducedMotion();

  const SPACING = LiminalLayoutEngine.SPACING;

  const CONTROL_PADDING = LiminalLayoutEngine.CONTROL_PADDING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Primitive Hooks: body scroll lock, escape key, focus trap, outside click
  useScrollLock(isModalOpen);
  useEscapeKey(onClose, isModalOpen && closeOnEscape);
  const { handleKeyDown } = useFocusTrap(modalRef, isModalOpen, {
    autoFocus: true,
    restoreFocus: true,
  });
  useClickOutside(modalRef, () => {
    if (closeOnBackdrop) {
      onClose();
    }
  }, isModalOpen && closeOnBackdrop);

  if (!isModalOpen || typeof document === 'undefined') {
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
    background: VEIL.backdrop, // Sub-canvas C-1 veil
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${SPACING[4]}px`,
    boxSizing: 'border-box',
    animation: reduced ? 'none' : `liminalFadeIn 0.2s ${LiminalMotionEngine.EASING.out}`,
  };

  const modalContainerStyle: CSSProperties = {
    position: 'relative',
    width: `${sizeWidths[size]}px`,
    maxWidth: maxWidth ?? 'calc(100vw - 32px)',
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
    animation: reduced ? 'none' : `liminalModalSlide 0.25s ${LiminalMotionEngine.EASING.out}`,
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(5), // 23px
    lineHeight: TYPOGRAPHY[5].lh,
    letterSpacing: TYPOGRAPHY[5].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 3).color,
    margin: 0,
  };

  return createPortal(
    <div
      style={backdropStyle}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
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
            <div>
              <h2 id={titleId} style={titleStyle}>
                {title}
              </h2>
              {description && (
                <div
                  style={{
                    fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
                    color: getTextStyle('tertiary', 3).color,
                    marginTop: `${SPACING[1]}px`,
                  }}
                >
                  {description}
                </div>
              )}
            </div>
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
              padding: `${CONTROL_PADDING.sm.y}px`,
              cursor: 'pointer',
              color: getTextStyle('tertiary', 3).color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: `${RADIUS.chip}px`,
              transition: LiminalMotionEngine.TRANSITION.fast,
            }}
          >
            <LiminalIcon icon={X} size="sm" weight="light" />
          </button>
        </div>

        {title && <Divider spacing="sm" />}

        {/* Body Content */}
        <div
          style={{
            flex: 1,
            color: getTextStyle('secondary', 3).color,
            fontSize: LiminalLayoutEngine.getTypeSizeCss(3),
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>

        {/* Footer Actions */}
        {actionContent && (
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
              {actionContent}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
