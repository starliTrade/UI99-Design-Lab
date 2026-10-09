import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';
import { getDirectionalRim, getTextStyle, SHADOWS, LADDER } from '../../../engine/spec-engine';
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

export interface SheetProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  position?: 'bottom' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'half' | 'full';
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Sheet({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
  footer,
  position = 'bottom',
  size = 'md',
  showHandle = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  style: customStyle = {},
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const isSheetOpen = open ?? isOpen ?? false;
  const actionContent = actions ?? footer;
  const reduced = useReducedMotion();

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Primitive Hooks: body scroll lock, escape key, focus trap, outside click
  useScrollLock(isSheetOpen);
  useEscapeKey(onClose, isSheetOpen && closeOnEscape);
  const { handleKeyDown } = useFocusTrap(sheetRef, isSheetOpen, {
    autoFocus: true,
    restoreFocus: true,
  });
  useClickOutside(sheetRef, () => {
    if (closeOnBackdrop) {
      onClose();
    }
  }, isSheetOpen && closeOnBackdrop);

  if (!isSheetOpen || typeof document === 'undefined') {
    return null;
  }

  const rightWidths: Record<'sm' | 'md' | 'lg' | 'half' | 'full', string | number> = {
    sm: 320,
    md: 400,
    lg: 480,
    half: '50vw',
    full: '100vw',
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
    animation: reduced ? 'none' : 'liminalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
          animation: reduced ? 'none' : 'liminalSheetSlideBottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      : {
          top: 0,
          right: 0,
          bottom: 0,
          width: typeof rightWidths[size] === 'number' ? `${rightWidths[size]}px` : rightWidths[size],
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '100vh',
          borderRadius: `${RADIUS.panel}px 0 0 ${RADIUS.panel}px`,
          padding: `${SPACING[5]}px`,
          animation: reduced ? 'none' : 'liminalSheetSlideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
        {/* Handle for bottom drawers */}
        {isBottom && showHandle && (
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: `${RADIUS.full}px`,
              background: 'rgba(255, 255, 255, 0.20)',
              margin: '0 auto',
              marginBottom: `${SPACING[3]}px`,
              cursor: 'grab',
            }}
          />
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
            <div>
              <h2 id="liminal-sheet-title" style={titleStyle}>
                {title}
              </h2>
              {subtitle && (
                <div
                  style={{
                    fontSize: `${TYPOGRAPHY[2].fs}px`,
                    color: getTextStyle('tertiary', 2).color,
                    marginTop: '2px',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
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
              transition: LiminalMotionEngine.TRANSITION.fast,
            }}
          >
            <LiminalIcon icon={X} size="sm" weight="light" />
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

        {/* Actions / Footer */}
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

export default Sheet;
