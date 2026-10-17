import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';

/**
 * LIMINAL · LABEL
 *
 * The name of a control, tied to it.
 *
 * `htmlFor` is REQUIRED and not optional. A `<label>` with no `for` is text that
 * looks like a label and is not one: clicking it does nothing, and a screen
 * reader does not connect it to the field. The element exists to make that
 * connection, and a label without it is a decoration.
 *
 *   role        none. It paints nothing.
 *   tokens      the type scale and the text roles.
 *   a11y        `htmlFor` is required; `required` renders the marker AND sets
 *               nothing on its own — the input carries `aria-required`.
 *   RTL         logical properties only.
 *   fixture     one row.
 */
export interface LabelProps {
  /** The id of the control this names. Required — see above. */
  htmlFor: string;
  children?: ReactNode;
  /** Marks it as required. The marker is visual; the input carries the ARIA. */
  required?: boolean;
  /** Explains what is wrong. Rendered as the danger role, and announced. */
  error?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { htmlFor, children, required = false, error, disabled = false, className, style: customStyle },
  forwardedRef,
) {
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  return (
    <label
      ref={forwardedRef}
      htmlFor={htmlFor}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: `${L.SPACING[0]}px`,
        ...L.getTypeStyle(2),
        color: error ? SEMANTICS.DANGER.text : getTextStyle('secondary', 2).color,
        opacity: disabled ? 0.5 : 1,
        ...customStyle,
      }}
    >
      {children}
      {required && (
        <span aria-hidden style={{ color: SEMANTICS.DANGER.text }}>
          *
        </span>
      )}
    </label>
  );
});

export default Label;
