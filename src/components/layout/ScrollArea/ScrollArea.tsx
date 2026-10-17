import React, { forwardRef, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import './scroll-area.css';

/**
 * LIMINAL · SCROLL AREA
 *
 * A region that scrolls, and that a KEYBOARD can scroll.
 *
 * The second half is the reason this exists. A `<div>` with `overflow: auto` is
 * scrollable by pointer and by nothing else: a keyboard reader who tabs to the
 * end of the content inside it cannot reach the rest, and there is no way to
 * scroll the box itself. WCAG 2.1.1 is explicit about it. So the region is
 * focusable and labelled — and it is focusable ONLY when it actually overflows,
 * because a tab stop that does nothing is its own defect.
 *
 *   role        none. It paints nothing; the scrollbar is the browser's.
 *   tokens      the scrollbar's colours come from the engine, as variables.
 *   a11y        `tabIndex={0}` and a name when it scrolls, so the region is
 *               reachable and announced; `role="group"` only then.
 *   RTL         the browser places the scrollbar; `overflow` is not directional.
 *   fixture     one row.
 */
/**
 * A step in the engine's spacing scale.
 *
 * `keyof typeof L.SPACING` widens to `number` on a readonly numeric-keyed
 * object, which loses the whole point of the type. This names the union.
 */
type SpaceStep = keyof typeof L.SPACING;

export interface ScrollAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  /**
   * The height it scrolls within, as a STEP IN THE SCALE.
   *
   * It accepted a number too, and that was ambiguous: `maxHeight={6}` could mean
   * six pixels or step six, and the component silently chose pixels. The
   * contract's first rule is that a value becomes a token and a selection
   * becomes a name — so this takes a NAME. A consumer who wants pixels has
   * `style`.
   */
  maxHeight?: SpaceStep;
  /** An accessible name. Required when it scrolls, because it becomes a stop. */
  label?: string;
  axis?: 'y' | 'x' | 'both';
  className?: string;
  style?: CSSProperties;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, maxHeight = 6, label, axis = 'y', className, style: customStyle, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const height = `${L.SPACING[maxHeight]}px`;

  return (
    <div
      ref={setRefs}
      // A scrollable region that cannot be focused cannot be scrolled by
      // keyboard. The name is required for the same reason: a tab stop with no
      // name is a stop the reader cannot identify.
      tabIndex={label ? 0 : undefined}
      role={label ? 'group' : undefined}
      aria-label={label}
      className={className ? `liminal-scroll-area ${className}` : 'liminal-scroll-area'}
      {...rest}
      style={{
        maxHeight: axis === 'x' ? undefined : height,
        overflowY: axis === 'x' ? 'hidden' : 'auto',
        overflowX: axis === 'y' ? 'hidden' : 'auto',
        minWidth: 0,
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
});

export default ScrollArea;
