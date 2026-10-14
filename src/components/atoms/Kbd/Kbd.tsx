import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · KBD
 *
 * A keyboard key, named.
 *
 * It is a `<kbd>` and not a styled span, because the element exists and a screen
 * reader reads it as input. And it is a WELL, not a control: a key is not
 * something the reader presses with a pointer, it is something they are told to
 * press — so it sits below the surface rather than above it.
 *
 *   role        `well` — the resting fill of something that is not pressed.
 *   tokens      zero raw values.
 *   a11y        a real `<kbd>`, so the platform announces it as input.
 *   RTL         the key's label is not translated; `⌘` stays `⌘`.
 *   fixture     one row.
 */
export interface KbdProps {
  children?: ReactNode;
  /** The key combination, when it is more than one key. Rendered as separate caps. */
  keys?: string[];
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, keys, size = 'md', className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  const surface = resolveSurface({ role: 'well', on: host });
  const pad = size === 'sm' ? `${L.SPACING[0]}px ${L.SPACING[1]}px` : `${L.SPACING[1]}px ${L.SPACING[2]}px`;
  const style: CSSProperties = {
    // The WELL's rim, which is what makes a key look like a key rather than a
    // shade. A key is a TARGET — the reader is told to press it — and a target
    // that is felt but not seen is one they cannot find.
    ...surface.style,
    ...(surface.rimColors ? { background: surface.rimColors.cssBackground } : null),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: size === 'sm' ? 18 : 22,
    padding: pad,
    borderRadius: `${L.RADIUS.chip}px`,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: size === 'sm' ? 10 : 11,
    lineHeight: 1,
    color: getTextStyle('secondary', 2).color,
    ...customStyle,
  };
  const list = keys ?? (children ? [String(children)] : []);
  return (
    <span ref={forwardedRef} className={className} style={{ display: 'inline-flex', gap: `${L.SPACING[0]}px`, alignItems: 'center' }}>
      {list.map((k, i) => (
        <kbd key={`${k}-${i}`} style={style}>
          {k}
        </kbd>
      ))}
    </span>
  );
});

export default Kbd;
