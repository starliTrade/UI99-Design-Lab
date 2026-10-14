import React, { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { VEIL, Z_INDEX } from '../../../engine/spec-engine';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useEscapeKey, useFocusTrap, useReducedMotion, useScrollLock } from '../../../engine/liminal-hooks';
import { resolveSurface } from '../../../engine/liminal-surface';
import { mistCssVars } from '../../../engine/liminal-mist';
import { Button } from '../../atoms/Button/Button';

/**
 * LIMINAL · ALERT DIALOG
 *
 * A modal that asks a question the reader cannot ignore, and the third component
 * built to COMPONENT-CONTRACT.md. Its one rule is the reason it exists as a
 * separate component rather than a `Modal` with a `destructive` prop:
 *
 *   FOCUS LANDS ON THE SAFE ACTION.
 *
 * A confirmation that puts focus on "Delete" is one stray Enter away from the
 * thing it was asking about. The reader who opens a destructive dialog and
 * presses Enter without reading must get the outcome that costs nothing. So the
 * cancel action takes focus, and the destructive one is never the default.
 *
 *   role        `modal` — S7, rim 3, shadow E3. Declared, never picked.
 *   sizes       none. A question is not a size.
 *   variants    none. `destructive` is a PROPERTY of the action, not a look.
 *   states      closed · open.
 *   tokens      zero raw values.
 *   a11y        role="alertdialog" (not dialog — a screen reader announces it
 *               with urgency), aria-modal, aria-labelledby/aria-describedby,
 *               focus trapped and moved to the SAFE action, Escape cancels,
 *               scroll locked behind it.
 *   RTL         logical properties only.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface AlertDialogProps {
  open: boolean;
  /** The question. Required — an alert dialog without one is a wall. */
  title: string;
  /** What happens if they agree. Not decoration: this is the consequence. */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * Whether confirming DESTROYS something.
   *
   * It changes which action is safe, and therefore which one takes focus — and
   * it colours the confirm button. It does not change the layout, because a
   * destructive question is not a different shape.
   */
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(function AlertDialog(
  {
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
    children,
    className,
    style: customStyle,
  },
  forwardedRef,
) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useFocusTrap(panelRef, open);
  useScrollLock(open);
  useEscapeKey(() => onCancel?.(), open);

  // THE RULE. Focus goes to the safe action, always — and where there is no
  // destructive action, the confirm button is the safe one and takes it.
  useEffect(() => {
    if (!open) return;
    const target = destructive ? cancelRef.current : confirmRef.current;
    target?.focus();
  }, [open, destructive]);

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

  return (
    <LiminalPortal>
      {/* The scrim. A click target for cancel, and the engine's own veil.
          The first version of this line wrote `rgba(3, 4, 6, 0.72)` by hand —
          a fourth hand-picked value in a component whose whole point was not to
          have one. The engine publishes `VEIL.backdrop` at 0.60. */}
      <div
        onClick={() => onCancel?.()}
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={className}
        style={{
          ...surface.style,
          ...mist,
          position: 'fixed',
          // Logical, so it centres in both directions without a physical rule.
          insetInlineStart: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: Z_INDEX.modal,
          width: `min(440px, calc(100vw - ${L.SPACING[5] * 2}px))`,
          borderRadius: `${L.RADIUS.card}px`,
          padding: `${L.SPACING[5]}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${L.SPACING[3]}px`,
          ...customStyle,
        }}
      >
        <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
          {title}
        </h2>
        {description && (
          <p id={descId} style={{ margin: 0, fontSize: 13, lineHeight: 1.9 }}>
            {description}
          </p>
        )}
        {children}
        <div
          style={{
            display: 'flex',
            gap: `${L.SPACING[2]}px`,
            justifyContent: 'flex-end',
            marginBlockStart: `${L.SPACING[2]}px`,
            flexWrap: 'wrap',
          }}
        >
          <Button ref={cancelRef} variant="secondary" onClick={() => onCancel?.()}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={destructive ? 'danger' : 'primary'}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </LiminalPortal>
  );
});

export default AlertDialog;
