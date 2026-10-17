import React, { forwardRef, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useFocusTrap } from '../../../engine/liminal-hooks';

/**
 * LIMINAL · FOCUS SCOPE
 *
 * A region that keeps Tab inside it while it is active.
 *
 * It is a COMPONENT rather than a hook because three components in this library
 * needed the same three lines — `Popover`, `AlertDialog` and `Drawer` each
 * called `useFocusTrap` on a ref they had to build themselves. A hook is the
 * mechanism; a scope is the thing a consumer reaches for.
 *
 *   role        none. It paints nothing.
 *   tokens      none.
 *   a11y        it TRAPS focus, which is a serious thing to do: a trap with no
 *               way out is a keyboard prison. So `onEscape` and `onUnmount` are
 *               first-class, and the component documents that a scope without an
 *               exit is a defect rather than a configuration.
 *   RTL         focus order is not directional.
 *   fixture     one row.
 */
export interface FocusScopeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  /** Whether the trap is armed. A scope that is always on is a prison. */
  active?: boolean;
  /**
   * Called when the reader presses Escape.
   *
   * A trap MUST have an exit. If this is not given, the component still lets
   * Escape through to the document — it does not swallow it, because swallowing
   * the only key that could free the reader is worse than not trapping.
   */
  onEscape?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const FocusScope = forwardRef<HTMLDivElement, FocusScopeProps>(function FocusScope(
  { children, active = true, onEscape, className, style: customStyle, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  useFocusTrap(innerRef, active);

  return (
    <div
      ref={setRefs}
      className={className}
      {...rest}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onEscape) {
          e.stopPropagation();
          onEscape();
        }
      }}
      style={{ minWidth: 0, ...customStyle }}
    >
      {children}
    </div>
  );
});

export default FocusScope;
