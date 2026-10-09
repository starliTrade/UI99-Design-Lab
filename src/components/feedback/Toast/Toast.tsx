import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle, SHADOWS } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';

export interface ToastProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  semantic?: 'success' | 'warning' | 'danger' | 'info';
  message?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  position?: 'bottom-center' | 'top-center';
  className?: string;
  style?: CSSProperties;
}

export function Toast({
  open,
  isOpen,
  onClose,
  semantic = 'success',
  message,
  title,
  description,
  action,
  duration = 4000,
  position = 'bottom-center',
  className = '',
  style: customStyle = {},
}: ToastProps) {
  const isToastOpen = open ?? isOpen ?? false;
  const reduced = useReducedMotion();
  const [closeHovered, setCloseHovered] = useState<boolean>(false);
  const [actionHovered, setActionHovered] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const semKey = semantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  const semanticObj = SEMANTICS[semKey] ?? SEMANTICS.SUCCESS;
  const solidColor = semanticObj.solid;

  // Auto-dismiss management with hover pause
  const startTimer = () => {
    if (duration > 0 && isToastOpen) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isToastOpen) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isToastOpen, duration]);

  if (!isToastOpen || typeof document === 'undefined') return null;

  // LIMINAL MIST: tier 'quiet' + ringLayer + composite with deep gravity anchor SHADOWS[4]
  const mist = LiminalColorEngine.getMistStyle(solidColor, 'quiet');
  const compositeBoxShadow = `${mist.boxShadow}, ${SHADOWS[4]}`;

  const defaultIcons: Record<'success' | 'warning' | 'danger' | 'info', ReactNode> = {
    success: <LiminalIcon icon={CheckCircle} size="sm" weight="light" color={solidColor} />,
    warning: <LiminalIcon icon={Warning} size="sm" weight="light" color={solidColor} />,
    danger: <LiminalIcon icon={XCircle} size="sm" weight="light" color={solidColor} />,
    info: <LiminalIcon icon={Info} size="sm" weight="light" color={solidColor} />,
  };

  const isBottom = position === 'bottom-center';

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 110,
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[3]}px`,
    boxSizing: 'border-box',
    ...(isBottom
      ? { bottom: `${SPACING[5]}px` }
      : { top: `${SPACING[5]}px` }),
  };

  const toastStyle: CSSProperties = {
    position: 'relative',
    overflow: 'visible',
    background: mist.background,
    boxShadow: compositeBoxShadow,
    borderRadius: `${RADIUS[12]}px`, // 12px
    padding: `${SPACING[3]}px ${SPACING[4]}px`, // 12px 16px
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[3]}px`, // 12px
    minWidth: '280px',
    maxWidth: 'calc(100vw - 32px)',
    boxSizing: 'border-box',
    animation: reduced
      ? 'none'
      : LiminalMotionEngine.enterFrom(isBottom ? 'bottom' : 'top', 16),
    ...customStyle,
  };

  return createPortal(
    <div style={containerStyle} className="liminal-toast-portal">
      <div
        role="status"
        aria-live="polite"
        className={className}
        style={toastStyle}
        onMouseEnter={pauseTimer}
        onMouseLeave={startTimer}
      >
        {/* ─── RING LAYER (separate blurred 1px border element) ─── */}
        <span aria-hidden="true" style={mist.ringLayer} />

        {/* Signal indicator */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {defaultIcons[semantic]}
        </div>

        {/* Message */}
        <div
          style={{
            flex: 1,
            fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
            lineHeight: TYPOGRAPHY[2].lh,
            color: getTextStyle('primary', 4).color,
            margin: 0,
            userSelect: 'none',
          }}
        >
          {title || description ? (
            <div className="flex flex-col">
              {title && <span className="font-semibold text-white/90">{title}</span>}
              {description && (
                <span style={{ color: getTextStyle('secondary', 4).color, fontSize: '11px', marginTop: '2px' }}>
                  {description}
                </span>
              )}
            </div>
          ) : (
            message
          )}
        </div>

        {/* Optional Action Button */}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            onMouseEnter={() => setActionHovered(true)}
            onMouseLeave={() => setActionHovered(false)}
            style={{
              background: actionHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: `${RADIUS[6]}px`,
              color: semanticObj.text,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: LiminalMotionEngine.getTransition('background', 'fast'),
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            {action.label}
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          aria-label="Dismiss toast"
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '2px',
            cursor: 'pointer',
            color: closeHovered
              ? getTextStyle('secondary', 4).color
              : getTextStyle('tertiary', 4).color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: `${RADIUS[4]}px`,
            transition: LiminalMotionEngine.getTransition('color', 'fast'),
            flexShrink: 0,
          }}
        >
          <LiminalIcon icon={X} size="xs" weight="light" />
        </button>
      </div>
    </div>,
    document.body
  );
}

export default Toast;
