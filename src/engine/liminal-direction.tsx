import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode, ReactElement } from 'react';

/**
 * LIMINAL · DIRECTION
 * «جهت، یک ویژگیِ زبان است — نه یک تنظیمِ ظاهری.»
 *
 * The system was written left-to-right by accident, not by decision: 39
 * physical properties (`left`, `marginLeft`, `textAlign: 'left'`) and ZERO
 * logical ones. So every one of them is a place where the layout silently
 * mirrors wrong.
 *
 * Two halves, and both are needed:
 *
 *   1. `dir` on the document, so the browser knows the base direction and
 *      resolves `start`/`end`, bidi runs and the scroll origin.
 *   2. Logical properties in the components, so `start`/`end` mean what they
 *      say. A physical `marginLeft` does not flip when `dir` changes; a logical
 *      `marginInlineStart` does.
 *
 * Setting only one of the two produces a layout that is half-mirrored, which is
 * worse than one that is not mirrored at all.
 */
export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

export function DirProvider({
  dir,
  children,
}: {
  dir: Direction;
  children: ReactNode;
}): ReactElement {
  // The document element is where `dir` belongs: it sets the base direction for
  // everything, including content rendered through a portal outside this tree.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('dir');
    root.setAttribute('dir', dir);
    return () => {
      if (previous === null) root.removeAttribute('dir');
      else root.setAttribute('dir', previous);
    };
  }, [dir]);

  return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
}

/** The base direction. Defaults to `ltr`, like the document. */
export function useDirection(): Direction {
  return useContext(DirectionContext);
}

/** True when the base direction is right-to-left. */
export function useIsRTL(): boolean {
  return useContext(DirectionContext) === 'rtl';
}

/**
 * A value that depends on the direction, resolved without a hook.
 *
 * For the places that cannot call a hook — a plain function computing a style,
 * a module-level helper — the direction is passed in rather than guessed.
 */
export function pick<T>(dir: Direction, ltr: T, rtl: T): T {
  return dir === 'rtl' ? rtl : ltr;
}

/**
 * The inline axis, named. `start` is the side a line of text begins on: left in
 * LTR, right in RTL. Anything that used to say `left` and meant "the beginning"
 * should say this instead.
 */
export function inlineStart(dir: Direction): 'left' | 'right' {
  return dir === 'rtl' ? 'right' : 'left';
}

export function inlineEnd(dir: Direction): 'left' | 'right' {
  return dir === 'rtl' ? 'left' : 'right';
}
