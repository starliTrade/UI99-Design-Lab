import React, { forwardRef, useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · INPUT GROUP
 *
 * An input with something attached to it — a unit, a protocol, a button.
 *
 * THE ADDON IS NOT DECORATION, and the two kinds are announced differently:
 *
 *   a UNIT or a PROTOCOL ("$", "kg", "https://") is part of what the reader is
 *   entering, so it is `aria-hidden` and the LABEL carries the meaning. Reading
 *   "dollar" before "Amount" tells the reader nothing they did not have.
 *
 *   a BUTTON is a control, and it keeps its own name and its own tab stop.
 *
 * The focus ring covers the WHOLE group rather than the input alone, because the
 * addon is part of the thing the reader is operating — a ring around half of it
 * is a ring around the wrong half.
 *
 *   role        `control`, anchored on its host.
 *   tokens      zero raw values.
 *   a11y        decorative addons are `aria-hidden`; interactive ones keep their
 *               semantics; the ring is on the group.
 *   RTL         the addon order follows the document direction, because a
 *               protocol prefix belongs at the start of the value.
 *   fixture     one row.
 */
export interface InputGroupProps {
  children?: ReactNode;
  /** Rendered before the field. A unit or a protocol — not a label. */
  prefix?: ReactNode;
  /** Rendered after the field. */
  suffix?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { children, prefix, suffix, disabled = false, className, style: customStyle },
  forwardedRef,
) {
  const id = useId();
  const host = useHostSurface();
  const surface = resolveSurface({ role: 'control', on: host });

  const addon: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: `${L.SPACING[3]}px`,
    ...L.getTypeStyle(2),
    color: getTextStyle('tertiary', 2).color,
    opacity: disabled ? 0.5 : 1,
    // The addon is part of the control's surface, not a separate one: a second
    // well inside the field would read as a second control.
    background: 'transparent',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      ref={forwardedRef}
      data-liminal-surface=""
      className={className}
      style={{
        // THE VARIABLES, not only the static surface.
        //
        // The element opts into `data-liminal-surface`, and the layer's rule for
        // that attribute paints `--liminal-surface-idle`. Opting in without
        // publishing leaves a variable nothing reads — the group rendered
        // transparent, and the guard caught it rather than the eye.
        ...resolveInteractionVars({ role: 'control', on: host, idle: surface.background }),
        display: 'inline-flex',
        alignItems: 'stretch',
        width: '100%',
        borderRadius: `${L.RADIUS.control}px`,
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        ...customStyle,
      }}
    >
      {/* `aria-hidden`: a unit is part of the value, and the label already says
          what the field is for. */}
      {prefix && <span aria-hidden id={`${id}-prefix`} style={addon}>{prefix}</span>}
      <span style={{ display: 'flex', flex: 1, minWidth: 0 }}>{children}</span>
      {suffix && <span aria-hidden id={`${id}-suffix`} style={addon}>{suffix}</span>}
    </div>
  );
});

export default InputGroup;
