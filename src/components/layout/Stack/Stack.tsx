import React, { forwardRef } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';

/**
 * LIMINAL · STACK
 *
 * One direction, one gap, from the engine's spacing scale.
 *
 * It exists because the alternative is a `style={{ display: 'flex', gap: 12 }}`
 * in every consumer — a raw number, repeated, and outside the scale. A stack is
 * the smallest component that can remove a raw number from a page.
 *
 *   role        none. It paints nothing, so it has nothing to declare.
 *   sizes       none. Its gap IS the size, and the gap is a token.
 *   variants    `direction` and `align`, which are names for decisions.
 *   states      none.
 *   tokens      the gap comes from SPACING; a number is not accepted.
 *   a11y        it renders a plain element and adds no role, because a layout
 *               wrapper with a role is a landmark a screen reader has to
 *               navigate around for no reason.
 *   RTL         `row` follows the document direction, because it is a flex row.
 *   fixture     one row.
 */
export interface StackProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children?: ReactNode;
  /** The gap, as a STEP IN THE SCALE — not a number of pixels. */
  gap?: keyof typeof L.SPACING;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

const ALIGN = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' } as const;
const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' } as const;

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    children,
    gap = 3,
    direction = 'column',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    as: Tag = 'div',
    className,
    style: customStyle,
    ...rest
  },
  forwardedRef,
) {
  return (
    <Tag
      ref={forwardedRef}
      className={className}
      // A wrapper that swallows what it does not use is a wrapper a consumer
      // cannot pass `id`, `data-*` or `aria-*` through — the defect `Input`
      // carried for months.
      {...rest}
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: `${L.SPACING[gap]}px`,
        alignItems: ALIGN[align],
        justifyContent: JUSTIFY[justify],
        flexWrap: wrap ? 'wrap' : undefined,
        minWidth: 0,
        ...customStyle,
      }}
    >
      {children}
    </Tag>
  );
});

export default Stack;
