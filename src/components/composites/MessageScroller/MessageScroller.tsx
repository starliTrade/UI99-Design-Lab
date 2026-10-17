import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · MESSAGE SCROLLER
 *
 * A conversation that follows the newest message — until the reader says
 * otherwise.
 *
 * THE RULE, AND IT IS THE WHOLE COMPONENT: new content scrolls into view ONLY if
 * the reader was already at the bottom. Someone reading back through yesterday's
 * messages is not waiting for today's, and a list that yanks them to the bottom
 * every time a message arrives has taken a decision away from them.
 *
 * So when they are NOT at the bottom, the component does the other thing: it
 * offers a button. The reader chooses when to return.
 *
 * The threshold matters and is not a nicety. "At the bottom" within a few pixels
 * is what a person means by it — a strict equality would stop following the
 * moment a fractional pixel of rounding appeared, and the list would silently
 * stop following for no reason the reader could see.
 *
 *   role        `work` — the region is a surface.
 *   tokens      zero raw values.
 *   a11y        the region is scrollable AND focusable, so a keyboard can scroll
 *               it; the return button is named and appears only when it does
 *               something.
 *   RTL         logical properties only; scroll position is not directional.
 *   fixture     one row.
 */
export interface MessageScrollerProps {
  children?: ReactNode;
  /** How close to the bottom counts as "at the bottom". */
  threshold?: number;
  /** The height it scrolls within, as a step in the engine's scale. */
  maxHeight?: keyof typeof L.SPACING;
  /** Required: a scrollable region is a tab stop, and a stop needs a name. */
  label: string;
  /** The label on the button that returns to the newest message. */
  jumpLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export const MessageScroller = forwardRef<HTMLDivElement, MessageScrollerProps>(function MessageScroller(
  { children, threshold = 24, maxHeight = 6, label, jumpLabel = 'Jump to latest', className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  const isAtBottom = useCallback(
    (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight <= threshold,
    [threshold],
  );

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setAtBottom(true);
  }, []);

  // On every content change: follow, or do not. The decision is the reader's,
  // and it was made by where they scrolled to.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (atBottom) el.scrollTop = el.scrollHeight;
  }, [children, atBottom]);

  return (
    <div
      className={className}
      style={{ position: 'relative', minWidth: 0, ...customStyle }}
    >
      <div
        ref={(node) => {
          scrollRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        // A scrollable region that cannot be focused cannot be scrolled by
        // keyboard — WCAG 2.1.1 — and a tab stop needs a name.
        tabIndex={0}
        role="log"
        aria-label={label}
        onScroll={(e) => setAtBottom(isAtBottom(e.currentTarget))}
        style={{
          ...resolveSurface({ role: 'work', on: host }).style,
          maxHeight: `${L.SPACING[maxHeight]}px`,
          overflowY: 'auto',
          borderRadius: `${L.RADIUS.card}px`,
          padding: `${L.SPACING[2]}px`,
          minWidth: 0,
        }}
      >
        {children}
      </div>

      {/* Only when it does something. A button that is always there and usually
          does nothing is a button the reader stops reading. */}
      {!atBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          data-liminal-surface=""
          style={{
            ...L.getTypeStyle(1),
            position: 'absolute',
            insetInlineEnd: `${L.SPACING[3]}px`,
            bottom: `${L.SPACING[3]}px`,
            padding: `${L.SPACING[1]}px ${L.SPACING[3]}px`,
            border: 'none',
            borderRadius: `${L.RADIUS.chip}px`,
            cursor: 'pointer',
            color: getTextStyle('primary', 1).color,
            transition: M.getTransition('opacity', 'fast'),
            ...resolveInteractionVars({
              role: 'control',
              on: host,
              idle: resolveSurface({ role: 'well', on: host }).rimColors?.cssBackground,
            }),
          }}
        >
          {jumpLabel}
        </button>
      )}
    </div>
  );
});

export default MessageScroller;
