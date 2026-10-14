import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * LIMINAL · ASPECT RATIO
 *
 * A box that keeps its shape while its width changes.
 *
 * `aspect-ratio` is a CSS property now, and the padding-top hack it replaced is
 * the reason this component is three lines instead of thirty. What the component
 * adds is the guarantee that the CHILD fills the box and does not push it: a
 * child with intrinsic size will otherwise decide the height and the ratio
 * becomes a suggestion.
 *
 *   role        none. It paints nothing.
 *   tokens      the ratio is a NUMBER PAIR, not a token — `16/9` is not a value
 *               on a scale, it is a shape.
 *   a11y        no role, no landmark. A layout wrapper that announces itself is
 *               a wrapper a screen reader has to step through.
 *   RTL         a ratio has no direction.
 *   fixture     one row.
 */
export interface AspectRatioProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  /** Width over height: `16 / 9`, `1`, `4 / 3`. */
  ratio?: number;
  className?: string;
  style?: CSSProperties;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { children, ratio = 16 / 9, className, style: customStyle, ...rest },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      className={className}
      {...rest}
      style={{
        aspectRatio: String(ratio),
        // The child is positioned rather than laid out, so it cannot decide the
        // box's height. Without this the ratio holds only until something inside
        // is taller than it.
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
        ...customStyle,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'flex', minWidth: 0 }}>{children}</div>
    </div>
  );
});

export default AspectRatio;
