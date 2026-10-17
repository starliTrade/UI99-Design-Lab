import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { FOCUS_RING_COLOR } from '../../../engine/liminal-ladder';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import './message.css';

/**
 * LIMINAL · MESSAGE AND BUBBLE
 *
 * A conversation: who said it, and what they said.
 *
 * THE TAIL MIRRORS. THE TEXT DOES NOT. That is the whole of the RTL work here,
 * and it is easy to get backwards: a bubble's tail points at its sender, so in a
 * right-to-left document a tail on the start edge is on the RIGHT — and the
 * words inside it still run right-to-left because they are Arabic, not because
 * the layout said so. A component that mirrors its text has broken the text; one
 * that does not mirror its tail has pointed it at the wrong person.
 *
 * THE SENDER IS NOT COLOUR. "Me" and "them" are different surfaces, and a reader
 * who cannot see the difference is told by the label above the bubble. Colour is
 * the second signal, never the only one.
 *
 *   role        `work` for a bubble — it is a surface with text in it.
 *   tokens      zero raw values.
 *   a11y        the sender is in the DOM as text, not implied by a fill; a list
 *               of messages is `role="log"`, which announces arrivals without
 *               stealing focus.
 *   RTL         the tail is logical, the text is not mirrored.
 *   fixture     one row.
 */
export interface BubbleProps {
  children?: ReactNode;
  /** Who it is from. Decides the side, the fill and the tail. */
  from?: 'me' | 'them';
  /** The corner that points at the sender. Off for a follow-up in a run. */
  tail?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  { children, from = 'them', tail = true, className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  const mine = from === 'me';
  // "Mine" is the brand: a measurement of who is speaking, and a measurement has
  // to be readable against the surface behind it.
  const idle = mine ? FOCUS_RING_COLOR : resolveSurface({ role: 'well', on: host }).rimColors?.cssBackground;
  return (
    <div
      ref={forwardedRef}
      data-liminal-surface=""
      data-from={from}
      data-tail={tail ? '' : undefined}
      className={className ? `liminal-bubble ${className}` : 'liminal-bubble'}
      style={{
        ...resolveInteractionVars({ role: 'control', on: host, idle }),
        // The tail's colour, as a variable the stylesheet reads. A pseudo-element
        // cannot be reached from a style attribute, so the value travels.
        ['--liminal-bubble-tail' as string]: idle ?? 'transparent',
        display: 'inline-block',
        maxWidth: 'min(34rem, 82%)',
        padding: `${L.SPACING[2]}px ${L.SPACING[3]}px`,
        // The tail's corner is SQUARE, and it is the LOGICAL corner — so it
        // points at the sender in both directions without a second component.
        borderStartStartRadius: `${L.RADIUS.card}px`,
        borderStartEndRadius: `${L.RADIUS.card}px`,
        borderEndStartRadius: `${L.RADIUS.card}px`,
        borderEndEndRadius: `${L.RADIUS.card}px`,
        ...(tail
          ? mine
            ? { borderEndEndRadius: `${L.RADIUS.chip}px` }
            : { borderEndStartRadius: `${L.RADIUS.chip}px` }
          : null),
        ...L.getTypeStyle(2),
        // The engine's own on-brand reference, not a literal with a fallback.
        color: mine ? LiminalColorEngine.BRAND_PRIMARY.onColor : getTextStyle('primary', 2).color,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
});

export interface MessageProps {
  children?: ReactNode;
  from?: 'me' | 'them';
  /** Who said it. Rendered as text — the fill is the second signal, not the first. */
  name?: string;
  /** A time or a status. */
  meta?: string;
  avatar?: ReactNode;
  tail?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Message = forwardRef<HTMLLIElement, MessageProps>(function Message(
  { children, from = 'them', name, meta, avatar, tail = true, className, style: customStyle },
  forwardedRef,
) {
  const mine = from === 'me';
  return (
    <li
      ref={forwardedRef}
      className={className}
      style={{
        display: 'flex',
        // A logical row: `row-reverse` for mine, so the avatar and the bubble
        // swap sides in both directions.
        flexDirection: mine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: `${L.SPACING[2]}px`,
        minWidth: 0,
        ...customStyle,
      }}
    >
      {avatar && <span style={{ flexShrink: 0 }}>{avatar}</span>}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 2, minWidth: 0 }}>
        {(name || meta) && (
          <span style={{ display: 'flex', gap: `${L.SPACING[2]}px`, ...L.getTypeStyle(1), color: getTextStyle('tertiary', 1).color }}>
            {name && <span>{name}</span>}
            {meta && <span>{meta}</span>}
          </span>
        )}
        <Bubble from={from} tail={tail}>{children}</Bubble>
      </div>
    </li>
  );
});

export interface MessageListProps {
  children?: ReactNode;
  /** Required: a log with no name is a region a reader cannot identify. */
  label: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * `role="log"`.
 *
 * It is a live region that announces ARRIVALS without stealing focus — which is
 * what a conversation needs and what `aria-live="assertive"` gets wrong: a
 * message that interrupts the reader mid-sentence is worse than one they read
 * when they get there.
 */
export const MessageList = forwardRef<HTMLOListElement, MessageListProps>(function MessageList(
  { children, label, className, style: customStyle },
  forwardedRef,
) {
  return (
    <ol
      ref={forwardedRef}
      /**
       * A LOG IS A LIVE REGION, AND `<ol>` CANNOT BE ONE.
       *
       * `role="log"` was here, and axe is right to refuse it: `log` is not an
       * allowed role on `<ol>`, and an `<ol>` with an explicit role stops being
       * a list — so its `<li>` children became list items outside a list, two
       * violations from one attribute.
       *
       * The two attributes below ARE what `role="log"` means: the role has
       * implicit `aria-live="polite"` and `aria-relevant="additions"`, and both
       * are global — allowed on a list. So the transcript keeps its structure
       * (an ordered list, because a conversation is ordered) and keeps its
       * announcement behaviour, without pretending to be a role it cannot be.
       */
      aria-live="polite"
      aria-relevant="additions"
      aria-label={label}
      className={className}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: `${L.SPACING[3]}px`,
        minWidth: 0,
        ...customStyle,
      }}
    >
      {children}
    </ol>
  );
});

export default Message;
