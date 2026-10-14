import React, { forwardRef, useCallback, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { Collapsible } from '../Collapsible/Collapsible';

/**
 * LIMINAL · ACCORDION
 *
 * A SET of disclosures, and the policy that makes them a set.
 *
 * `Collapsible` is one region with a trigger. An accordion is several, plus a
 * rule about how many may be open — and that rule is the whole component. It is
 * separate for the reason `Collapsible` says in its own comment: folding the
 * policy in would make every single disclosure carry the policy of a group.
 *
 *   THE TRIGGERS ARE HEADINGS. That is how a screen reader navigates between
 *   them, and it is the one part of the pattern a consumer cannot be trusted to
 *   add — so `headingLevel` is on and defaults to 3.
 *
 *   ↑ ↓ AND HOME / END move between the triggers, because a set of headers is a
 *   thing the reader moves through, not a list they tab through. Tab reaches the
 *   accordion once and the arrow keys do the rest.
 *
 *   role        `work` — each panel is a surface.
 *   states      open · closed · disabled, per item.
 *   tokens      zero raw values.
 *   a11y        headings containing buttons, `aria-expanded` and `aria-controls`
 *               from `Collapsible`, and arrow-key movement between the headers.
 *   RTL         logical properties only; the chevron is a rotation.
 *   fixture     one row.
 */
export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /**
   * The policy.
   *
   * `single` closes the others when one opens — a set of tabs in disguise, and
   * the right shape when the panels are alternatives. `multiple` lets the reader
   * open what they want, which is the right shape when the panels are sections
   * of one thing.
   */
  type?: 'single' | 'multiple';
  /** The open ids. Controlled; omit for uncontrolled. */
  open?: string[];
  defaultOpen?: string[];
  onOpenChange?: (open: string[]) => void;
  /** The heading level for the triggers. 3 by default — see above. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  style?: CSSProperties;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, type = 'multiple', open: controlledOpen, defaultOpen = [], onOpenChange, headingLevel = 3, className, style: customStyle },
  forwardedRef,
) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;
  const rootRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(
    (id: string, next: boolean) => {
      if (type === 'single') {
        setOpen(next ? [id] : []);
        return;
      }
      setOpen(next ? [...open, id] : open.filter((x) => x !== id));
    },
    [type, open, setOpen],
  );

  /**
   * ↑ ↓ Home End between the triggers.
   *
   * A set of headers is a thing the reader MOVES THROUGH. Tab reaches the
   * accordion once and the arrows do the rest — a reader who has to tab through
   * nine headers to reach the tenth has been given a list, not an accordion.
   */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const triggers = [...(rootRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-expanded]') ?? [])].filter(
      (b) => !b.disabled,
    );
    const at = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    const go = (next: number) => {
      e.preventDefault();
      triggers[(next + triggers.length) % triggers.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(at + 1);
    else if (e.key === 'ArrowUp') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(triggers.length - 1);
  }, []);

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={className}
      onKeyDown={onKeyDown}
      style={{ display: 'flex', flexDirection: 'column', gap: `${L.SPACING[1]}px`, minWidth: 0, ...customStyle }}
    >
      {items.map((item) => (
        <Collapsible
          key={item.id}
          title={item.title}
          headingLevel={headingLevel}
          disabled={item.disabled}
          open={open.includes(item.id)}
          onOpenChange={(next) => toggle(item.id, next)}
        >
          {item.content}
        </Collapsible>
      ))}
    </div>
  );
});

export default Accordion;
