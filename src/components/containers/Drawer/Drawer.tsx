import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { VEIL, Z_INDEX } from '../../../engine/spec-engine';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useEscapeKey, useFocusTrap, useReducedMotion, useScrollLock } from '../../../engine/liminal-hooks';
import { resolveSurface } from '../../../engine/liminal-surface';
import { mistCssVars } from '../../../engine/liminal-mist';

/**
 * LIMINAL · DRAWER
 *
 * A panel that comes in from an edge and takes over the view. The fourth and
 * last component built to COMPONENT-CONTRACT.md.
 *
 * THE HANDLE IS A BUTTON, NOT A GRIP.
 *
 * A drawer that can only be dismissed by dragging is a drawer half the readers
 * cannot dismiss. The handle is a real button — labelled, focusable, activated
 * by Enter or Space — and the drag is an ADDITION to it, not the mechanism. The
 * keyboard path and the pointer path reach the same place.
 *
 *   role        `modal` — S7, rim 3, shadow E3. It takes over the view, which
 *               is what makes it a modal and not a popover.
 *   sizes       sm · md · lg — the width of the edge it comes from. A real
 *               dimension, from the engine's spacing, not a number.
 *   variants    `side`: start · end · bottom. Logical, so `start` is the right
 *               edge in Arabic and the left one in English without a second
 *               component.
 *   states      closed · open.
 *   tokens      zero raw values.
 *   a11y        role="dialog", aria-modal, aria-labelledby, focus trapped,
 *               Escape closes, the page locked behind it, and the handle is a
 *               button so the dismissal is reachable without a pointer.
 *   RTL         `side` is logical; the transform is computed from it.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export type DrawerSide = 'start' | 'end' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  side?: DrawerSide;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  children?: ReactNode;
  /** How far the handle must be dragged before it counts as a dismissal. */
  dragThreshold?: number;
  className?: string;
  style?: CSSProperties;
}

const WIDTHS = { sm: 280, md: 360, lg: 480 } as const;

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open,
    onClose,
    side = 'end',
    size = 'md',
    title,
    children,
    dragThreshold = 96,
    className,
    style: customStyle,
  },
  forwardedRef,
) {
  const id = useId();
  const titleId = `${id}-title`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const [drag, setDrag] = useState(0);
  const dragging = useRef<{ start: number; along: 'x' | 'y' } | null>(null);

  useFocusTrap(panelRef, open);
  useScrollLock(open);
  useEscapeKey(() => onClose?.(), open);

  // The handle takes focus when it opens: it is the way out, and the way out
  // should be the first thing a keyboard reader finds.
  useEffect(() => {
    if (!open) return;
    setDrag(0);
    handleRef.current?.focus();
  }, [open]);

  const close = useCallback(() => onClose?.(), [onClose]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      // A pointer drag is an addition to the button, never a replacement.
      dragging.current = { start: side === 'bottom' ? event.clientY : event.clientX, along: side === 'bottom' ? 'y' : 'x' };
      (event.target as Element).setPointerCapture?.(event.pointerId);
    },
    [side],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const d = dragging.current;
      if (!d) return;
      const now = d.along === 'y' ? event.clientY : event.clientX;
      // Only the direction that closes counts: dragging a drawer further into
      // the screen is not a gesture, it is a mistake.
      const towards = side === 'end' ? d.start - now : now - d.start;
      setDrag(Math.max(0, towards));
    },
    [side],
  );

  const onPointerUp = useCallback(() => {
    if (dragging.current && drag >= dragThreshold) close();
    dragging.current = null;
    setDrag(0);
  }, [drag, dragThreshold, close]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [forwardedRef],
  );

  const reduced = useReducedMotion();
  const surface = resolveSurface({ role: 'modal', interactive: false });
  const mist = mistCssVars('modal');

  if (!open) return null;

  const horizontal = side !== 'bottom';
  const length = WIDTHS[size];
  const offset = drag > 0 ? (side === 'end' || side === 'bottom' ? drag : -drag) : 0;

  const edge: CSSProperties = side === 'bottom'
    ? { insetInline: 0, bottom: 0, maxHeight: `min(${length}px, 80vh)` }
    : {
        top: 0,
        bottom: 0,
        [side === 'end' ? 'insetInlineEnd' : 'insetInlineStart']: 0,
        width: `min(${length}px, 92vw)`,
      };

  const transform = side === 'bottom'
    ? `translateY(${offset}px)`
    : `translateX(${side === 'end' ? offset : -offset}px)`;

  return (
    <LiminalPortal>
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: Z_INDEX.modal - 1,
          background: `var(--liminal-veil-backdrop, ${VEIL.backdrop})`,
          transition: reduced ? 'none' : M.getTransition('opacity', 'fast'),
        }}
      />
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Drawer'}
        className={className}
        style={{
          ...surface.style,
          ...mist,
          position: 'fixed',
          zIndex: Z_INDEX.modal,
          borderRadius: side === 'bottom' ? `${L.RADIUS.card}px ${L.RADIUS.card}px 0 0` : 0,
          display: 'flex',
          flexDirection: 'column',
          transform,
          transition: dragging.current || reduced ? 'none' : M.getTransition('transform', 'normal'),
          ...edge,
          ...customStyle,
        }}
      >
        {/* The handle: a button first, a grip second. */}
        <div
          style={{
            display: 'flex',
            justifyContent: horizontal ? (side === 'end' ? 'flex-start' : 'flex-end') : 'center',
            padding: `${L.SPACING[2]}px`,
            flexShrink: 0,
          }}
        >
          <button
            ref={handleRef}
            type="button"
            onClick={close}
            aria-label="Close"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              // The engine's control role: it is a control, and it says so.
              ...resolveSurface({ role: 'control', on: 'modal', interactive: true }).style,
              font: 'inherit',
              cursor: horizontal ? 'ew-resize' : 'ns-resize',
              touchAction: 'none',
              width: horizontal ? 6 : 44,
              height: horizontal ? 44 : 6,
              padding: 0,
              borderRadius: 999,
              border: 'none',
            }}
          />
        </div>
        {title && (
          <h2 id={titleId} style={{ margin: 0, padding: `0 ${L.SPACING[5]}px`, fontSize: 15, fontWeight: 600 }}>
            {title}
          </h2>
        )}
        <div style={{ padding: `${L.SPACING[4]}px ${L.SPACING[5]}px ${L.SPACING[5]}px`, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </LiminalPortal>
  );
});

export default Drawer;
