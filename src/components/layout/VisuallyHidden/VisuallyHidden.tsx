import React, { forwardRef } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import './visually-hidden.css';

/**
 * LIMINAL · VISUALLY HIDDEN
 *
 * Content a screen reader needs and the eye does not: a heading that names a
 * region, a "skip to content" link, the label of an icon-only control.
 *
 * IT IS NOT `display: none` AND IT IS NOT `opacity: 0`.
 *
 *   display: none     removes it from the accessibility tree entirely — the
 *                     screen reader never sees it, which is the opposite of the
 *                     point.
 *   opacity: 0        keeps it in the tree AND keeps it focusable, so a keyboard
 *                     reader tabs into something they cannot see. A skip link
 *                     built this way is a trap.
 *   width/height: 1px  keeps it in the tree, and `clip-path` takes it out of the
 *                     layout without taking it out of the reading order.
 *
 * The 1px box is deliberate and not a hack: a zero-sized element is skipped by
 * some assistive technology, so the smallest thing that is still an element is
 * the right size.
 */
export interface VisuallyHiddenProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children?: ReactNode;
  /** Render as something other than a span — a heading, a label, a div. */
  as?: ElementType;
  /** Show it when it takes focus. For skip links, which must become visible. */
  focusable?: boolean;
  className?: string;
  style?: CSSProperties;
}

const HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { children, as: Tag = 'span', focusable = false, className, style: customStyle, ...rest },
  forwardedRef,
) {
  return (
    <Tag
      ref={forwardedRef}
      className={className}
      {...rest}
      data-liminal-visually-hidden={focusable ? 'focusable' : ''}
      style={{ ...HIDDEN, ...customStyle }}
    >
      {children}
    </Tag>
  );
});

export default VisuallyHidden;
