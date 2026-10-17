import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';

/**
 * LIMINAL · MARKER
 *
 * A small label that names a thing: a count, a category, a state.
 *
 * IT IS NOT A BADGE, and the difference is what it is attached to. A Badge is a
 * standalone chip — it sits on a surface and is read on its own. A Marker is
 * attached to a line of text and is read WITH it: "Inbox 12" is one phrase, and
 * a screen reader that pauses between them has read two.
 *
 * So it renders a `<span>` inside the text flow rather than a chip beside it, and
 * its colour is a text role rather than a fill.
 *
 *   role        none. It is text.
 *   tokens      zero raw values.
 *   a11y        inline text, so it is read as part of the phrase it marks.
 *   RTL         the count follows the text, not the page.
 *   fixture     one row.
 */
export interface MarkerProps {
  children?: ReactNode;
  /** The semantic colour, when the marker carries meaning rather than a count. */
  semantic?: 'success' | 'warning' | 'danger' | 'info';
  /** Dimmer, for a count that is context rather than the point. */
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Marker = forwardRef<HTMLSpanElement, MarkerProps>(function Marker(
  { children, semantic, muted = false, className, style: customStyle },
  forwardedRef,
) {
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const colour = semantic ? SEMANTICS[semantic.toUpperCase() as 'SUCCESS'].text : getTextStyle(muted ? 'tertiary' : 'secondary', 2).color;
  return (
    <span
      ref={forwardedRef}
      className={className}
      style={{
        ...L.getTypeStyle(1),
        color: colour,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...customStyle,
      }}
    >
      {children}
    </span>
  );
});

export default Marker;
