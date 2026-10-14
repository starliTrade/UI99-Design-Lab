import React, { forwardRef } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import type { TextRole } from '../../../engine/liminal-contrast';

/**
 * LIMINAL · TYPOGRAPHY
 *
 * The type scale, as components, because a consumer should not have to call
 * `getTypeStyle` by hand to write a paragraph.
 *
 * THE SEMANTIC ELEMENT AND THE VISUAL SIZE ARE INDEPENDENT, and that is the
 * whole reason `as` exists. A document's outline is about structure — an `h2`
 * under an `h1` — and the scale is about size. A card's title is an `h3` that
 * looks like level 5; forcing those to agree is how a page ends up with a
 * heading level chosen for its size, which is a heading level chosen for the
 * wrong reason.
 *
 *   role        none. Text paints nothing.
 *   tokens      every size comes from `getTypeSizeCss`, which is a `rem`-based
 *               fluid clamp — so the reader's own font-size is honoured, which
 *               is WCAG 1.4.4 and not a nicety.
 *   a11y        `as` chooses the element; the default for `Heading` is a real
 *               heading, and `Text` defaults to a `<p>`.
 *   RTL         logical properties only; the type scale is direction-agnostic.
 *   fixture     one row.
 */
export interface TextProps {
  children?: ReactNode;
  /** A step on the engine's scale, 1–8. */
  level?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** The text role, which decides the alpha AND the floor it has to meet. */
  tone?: TextRole;
  /** The element. Independent of `level` — see above. */
  as?: ElementType;
  /** Small caps with the tracking the scale declares for it. */
  caps?: boolean;
  /** Truncate to one line. */
  truncate?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { children, level = 3, tone = 'secondary', as: Tag = 'p', caps = false, truncate = false, className, style: customStyle },
  forwardedRef,
) {
  return (
    <Tag
      ref={forwardedRef}
      className={className}
      style={{
        margin: 0,
        ...L.getTypeStyle(level, caps),
        color: getTextStyle(tone, level).color,
        ...(truncate ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : null),
        ...customStyle,
      }}
    >
      {children}
    </Tag>
  );
});

export interface HeadingProps {
  children?: ReactNode;
  /**
   * The DOCUMENT level, which decides the element: 1 is `<h1>`.
   *
   * It is not the visual size. `size` is.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * The VISUAL size, as a step on the engine's scale.
   *
   * Omitted, it follows the document level — `h1` is level 7, `h2` is 6, and so
   * on down to level 4. Given, it overrides, because a card's heading is
   * structurally an `h3` and visually whatever the card needs.
   */
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  tone?: TextRole;
  /** Truncate to one line. */
  truncate?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** The scale step a document level defaults to. */
const DEFAULT_SIZE: Record<number, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8> = { 1: 7, 2: 6, 3: 5, 4: 4, 5: 4, 6: 4 };

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { children, level = 2, size, tone = 'primary', truncate = false, className, style: customStyle },
  forwardedRef,
) {
  const Tag = `h${level}` as 'h1';
  const step = size ?? DEFAULT_SIZE[level];
  return (
    <Tag
      ref={forwardedRef}
      className={className}
      style={{
        margin: 0,
        ...L.getTypeStyle(step),
        color: getTextStyle(tone, step).color,
        ...(truncate ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : null),
        ...customStyle,
      }}
    >
      {children}
    </Tag>
  );
});

export default Text;
