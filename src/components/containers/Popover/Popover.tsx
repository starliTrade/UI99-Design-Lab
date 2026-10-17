import React, { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Z_INDEX } from '../../../engine/spec-engine';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useFloating, type Placement } from '../../../engine/liminal-floating';
import { useClickOutside, useEscapeKey, useFocusTrap, useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface } from '../../../engine/liminal-surface';
import { mistCssVars } from '../../../engine/liminal-mist';

/**
 * LIMINAL · POPOVER
 *
 * A surface that floats above the flow, anchored to the thing that opened it.
 * It is the first component built to COMPONENT-CONTRACT.md rather than before
 * it, so the ten rules are visible in the code rather than promised in a doc:
 *
 *   role        `popover` — S6, rim 3, shadow E2. Declared, never picked.
 *   sizes       none. A popover is sized by its content; a size prop would be
 *               a number with no meaning.
 *   states      closed · open. The open state is the engine's, not a fill
 *               chosen here.
 *   variants    none. There is one popover; `plain` and `padded` would be two
 *               names for one thing.
 *   tokens      zero raw values — every surface, border, shadow and duration
 *               comes from the engine.
 *   a11y        role="dialog", aria-expanded and aria-haspopup on the trigger,
 *               aria-controls pointing at the content, Escape to close, focus
 *               moved in when modal and returned to the trigger on close.
 *   RTL         positioned by the engine's own placement logic, which is
 *               direction-aware; the styles use logical properties only.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    a live page.
 *
 * WHAT IT IS NOT. A tooltip (no interaction, no focus) and a menu (a list of
 * commands with roving focus) are different things with different keyboard
 * contracts. This is the third: a small surface holding arbitrary content,
 * which the reader dismisses rather than completes.
 */
export interface PopoverProps {
  /** The element that opens it. Receives the ARIA wiring. */
  trigger: React.ReactElement<Record<string, unknown>>;
  children?: ReactNode;
  /** Where the engine should try to put it, before collision handling. */
  placement?: Placement;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the content traps focus.
   *
   * A popover holding a form wants the trap; one holding a paragraph does not,
   * and trapping focus for a paragraph is a trap the reader has to escape.
   */
  modal?: boolean;
  /** An accessible name for the surface. Required when it has no heading. */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    children,
    placement = 'bottom-start',
    open: controlledOpen,
    onOpenChange,
    modal = false,
    'aria-label': ariaLabel,
    className,
    style: customStyle,
  },
  forwardedRef,
) {
  const id = useId();
  const contentId = `${id}-content`;
  const triggerId = `${id}-trigger`;

  // `useFloating` owns dismissal, and that is the problem in a CONTROLLED
  // popover: its Escape handler sets its own internal state, which the consumer
  // never sees, so the popover closes and the consumer still thinks it is open.
  // One owner instead — the popover handles both dismissals and reports them.
  const floating = useFloating({ placement, closeOnClickOutside: false, closeOnEscape: false });
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : floating.isOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) (next ? floating.open : floating.close)();
      onOpenChange?.(next);
    },
    [isControlled, floating, onOpenChange],
  );

  // The engine closes on Escape and on an outside click; a controlled consumer
  // still has to hear about it, or the two disagree about whether it is open.
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (wasOpen.current && !isOpen) onOpenChange?.(false);
    wasOpen.current = isOpen;
  }, [isOpen, onOpenChange]);

  const reduced = useReducedMotion();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEscapeKey(() => setOpen(false), isOpen);
  useClickOutside(contentRef, () => setOpen(false), isOpen);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      floating.floatingRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [floating.floatingRef, forwardedRef],
  );

  // Focus goes in when it opens, and back to the trigger when it closes —
  // otherwise a keyboard reader is left at the top of the document.
  useFocusTrap(contentRef, isOpen && modal);
  useEffect(() => {
    if (!isOpen) return;
    const triggerEl = floating.triggerRef.current;
    if (!modal) contentRef.current?.focus();
    return () => triggerEl?.focus();
  }, [isOpen, modal, floating.triggerRef]);

  // The rim IS the border: `resolveSurface` draws it as a gradient layer, so a
  // separate `border` would be a second edge on the same edge.
  const surface = resolveSurface({ role: 'popover', interactive: false });
  const mist = mistCssVars('popover');

  const triggerEl = React.cloneElement(trigger, {
    id: triggerId,
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? contentId : undefined,
    ref: (node: HTMLElement | null) => {
      floating.triggerRef.current = node;
      const original = (trigger as unknown as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof original === 'function') original(node);
      else if (original) (original as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    onClick: (event: React.MouseEvent) => {
      (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(event);
      if (!event.defaultPrevented) setOpen(!isOpen);
    },
  });

  return (
    <>
      {triggerEl}
      {isOpen && (
        <LiminalPortal>
          <div
            ref={setRefs}
            id={contentId}
            role="dialog"
            aria-label={ariaLabel}
            aria-modal={modal || undefined}
            tabIndex={-1}
            data-liminal-placement={floating.position.placement}
            className={className}
            style={{
              ...surface.style,
              ...mist,
              position: 'fixed',
              insetInlineStart: floating.position.x,
              top: floating.position.y,
              zIndex: Z_INDEX.popover,
              borderRadius: `${L.RADIUS.card}px`,
              padding: `${L.SPACING[4]}px`,
              maxWidth: `min(360px, calc(100vw - ${L.SPACING[5] * 2}px))`,
              outline: 'none',
              transition: reduced ? 'none' : M.getTransition('opacity', 'fast'),
              ...customStyle,
            }}
          >
            {children}
          </div>
        </LiminalPortal>
      )}
    </>
  );
});

export default Popover;
