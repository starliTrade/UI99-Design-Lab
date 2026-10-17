import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Z_INDEX } from '../../../engine/spec-engine';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useFloating, type Placement } from '../../../engine/liminal-floating';
import { useEscapeKey, useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface } from '../../../engine/liminal-surface';
import { mistCssVars } from '../../../engine/liminal-mist';

/**
 * LIMINAL · HOVER CARD
 *
 * A surface that appears because the reader lingered, not because they asked.
 * It is the second component built to COMPONENT-CONTRACT.md, and its keyboard
 * contract is the OPPOSITE of the Popover's:
 *
 *   Popover      opened by a click, holds focus, dismissed by the reader
 *   HoverCard    opened by attention, takes NO focus, dismissed by leaving
 *
 * That difference is the whole component. A hover card that traps focus is a
 * popover that ambushed the reader; a popover that opens on hover is a hover
 * card that cannot be reached by keyboard.
 *
 *   role        `popover` — S6, rim 3, shadow E2. Declared, never picked.
 *   sizes       none. Sized by its content.
 *   variants    none.
 *   states      closed · open.
 *   tokens      zero raw values.
 *   a11y        focus opens it too, so it is not mouse-only; Escape closes it;
 *               the trigger carries aria-describedby while it is open. It does
 *               NOT take focus and does NOT trap it — nothing here is required
 *               reading, and stealing focus for a glance is a theft.
 *   RTL         the engine's placement, logical properties only.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface HoverCardProps {
  /** The element the reader lingers on. Receives the ARIA wiring. */
  trigger: React.ReactElement<Record<string, unknown>>;
  children?: ReactNode;
  placement?: Placement;
  /** How long the pointer must rest before it opens. */
  openDelay?: number;
  /** How long it waits before closing, so the pointer can travel into it. */
  closeDelay?: number;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(function HoverCard(
  {
    trigger,
    children,
    placement = 'bottom-start',
    openDelay = 320,
    closeDelay = 160,
    open: controlledOpen,
    onOpenChange,
    'aria-label': ariaLabel,
    className,
    style: customStyle,
  },
  forwardedRef,
) {
  const id = useId();
  const contentId = `${id}-content`;

  // The engine's dismissal is off for the same reason as the Popover's: it owns
  // internal state a controlled consumer never sees. One owner.
  const floating = useFloating({ placement, closeOnClickOutside: false, closeOnEscape: false });
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // One timer, cleared on every transition. Two timers racing is how a hover
  // card ends up open after the pointer has left.
  const timer = useRef<number | null>(null);
  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const schedule = useCallback(
    (next: boolean, delay: number) => {
      clear();
      timer.current = window.setTimeout(() => {
        timer.current = null;
        setOpen(next);
      }, delay);
    },
    [clear, setOpen],
  );
  useEffect(() => clear, [clear]);

  useEscapeKey(() => setOpen(false), isOpen);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      floating.floatingRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [floating.floatingRef, forwardedRef],
  );

  const reduced = useReducedMotion();
  const surface = resolveSurface({ role: 'popover', interactive: false });
  const mist = mistCssVars('popover');

  const triggerEl = React.cloneElement(trigger, {
    'aria-describedby': isOpen ? contentId : undefined,
    onMouseEnter: (event: React.MouseEvent) => {
      (trigger.props as { onMouseEnter?: (e: React.MouseEvent) => void }).onMouseEnter?.(event);
      schedule(true, openDelay);
    },
    onMouseLeave: (event: React.MouseEvent) => {
      (trigger.props as { onMouseLeave?: (e: React.MouseEvent) => void }).onMouseLeave?.(event);
      schedule(false, closeDelay);
    },
    // Keyboard reach: a hover card that only a mouse can open is a hover card
    // half the readers cannot reach. Focus opens it at once — a delay exists to
    // stop a passing pointer from firing it, and focus is never accidental.
    onFocus: (event: React.FocusEvent) => {
      (trigger.props as { onFocus?: (e: React.FocusEvent) => void }).onFocus?.(event);
      clear();
      setOpen(true);
    },
    onBlur: (event: React.FocusEvent) => {
      (trigger.props as { onBlur?: (e: React.FocusEvent) => void }).onBlur?.(event);
      schedule(false, closeDelay);
    },
    ref: (node: HTMLElement | null) => {
      floating.triggerRef.current = node;
      const original = (trigger as unknown as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof original === 'function') original(node);
      else if (original) (original as React.MutableRefObject<HTMLElement | null>).current = node;
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
            // `dialog` without `aria-modal`, and focus is NOT moved: the surface
            // is supplementary. A screen reader announces it when it appears,
            // and nothing the reader was doing is interrupted.
            role="dialog"
            aria-label={ariaLabel}
            onMouseEnter={clear}
            onMouseLeave={() => schedule(false, closeDelay)}
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
              maxWidth: `min(320px, calc(100vw - ${L.SPACING[5] * 2}px))`,
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

export default HoverCard;
