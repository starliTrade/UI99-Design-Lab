import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle, SHADOWS, SURFACE_TINT } from '../../../engine/spec-engine';
import { mistCssVars } from '../../../engine/liminal-mist';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveInteractionVars } from '../../../engine/liminal-surface';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';

/** A layout decision this component owns, not a system token. */
const TOAST_MIN_WIDTH = 280;

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

  // A toast floats at the top of the ladder, so it diffuses more, casts a larger
  // shadow and catches more light than any other surface. All of that follows
  // from role='toast' — nothing here is hand-tuned. The halo is neutral: a
  // success toast does not get green light.
  const mistVars = mistCssVars('toast');

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
    ...mistVars,
    position: 'relative',
    overflow: 'visible',
    borderRadius: `${RADIUS[12]}px`, // 12px
    padding: `${SPACING[3]}px ${SPACING[4]}px`, // 12px 16px
    display: 'flex',
    alignItems: 'center',
    gap: `${SPACING[3]}px`, // 12px
    minWidth: TOAST_MIN_WIDTH,
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
        data-liminal-mist=""

        role="status"
        aria-live="polite"
        className={className}
        style={toastStyle}
        onMouseEnter={pauseTimer}
        onMouseLeave={startTimer}
      >
        {/* ─── RING LAYER (separate blurred 1px border element) ─── */}

        {/* Signal indicator */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {defaultIcons[semantic]}
        </div>

        {/* Message */}
        <div
          style={{
            flex: 1,
            fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
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
                <span style={{ color: getTextStyle('secondary', 4).color, fontSize: LiminalLayoutEngine.getTypeSizeCss(1), marginTop: `${SPACING[0]}px` }}>
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
            data-liminal-surface=""
            style={{
              // The action's surface is the layer's, not state's. It lies flat
              // on the toast and lifts to a tint on hover, which it holds while
              // pressed — the toast is already the top of the ladder, so there
              // is no step above it for the engine to derive.
              ...resolveInteractionVars({
                role: 'control',
                on: 'toast',
                idle: 'transparent',
                hover: SURFACE_TINT.medium,
                active: SURFACE_TINT.medium,
              }),
              // `borderStyle`, not the `border` shorthand: the shorthand claims
              // `borderColor` too, which the layer owns. Saying only what this
              // component means — there is no border — leaves the layer able to
              // colour one if it ever draws it.
              borderStyle: 'none',
              padding: `${SPACING[1]}px ${SPACING[2]}px`,
              borderRadius: `${RADIUS[6]}px`,
              color: semanticObj.text,
              fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
              fontWeight: 500,
              cursor: 'pointer',
              transition: LiminalMotionEngine.getTransition('background', 'fast'),
              flexShrink: 0,
              userSelect: 'none',
            } as CSSProperties}
          >
            {action.label}
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          aria-label="Dismiss toast"
          onClick={onClose}
          data-liminal-hover-color=""
          style={{
            background: 'transparent',
            border: 'none',
            padding: `${SPACING[0]}px`,
            cursor: 'pointer',
            '--liminal-color-idle': getTextStyle('tertiary', 4).color,
            // primary, not secondary — see the note in Alert.
            '--liminal-hover-color': getTextStyle('primary', 4).color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: `${RADIUS[4]}px`,
            transition: LiminalMotionEngine.getTransition('color', 'fast'),
            flexShrink: 0,
          } as CSSProperties}
        >
          <LiminalIcon icon={X} size="xs" weight="light" />
        </button>
      </div>
    </div>,
    document.body
  );
}

export default Toast;
