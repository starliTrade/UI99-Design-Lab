import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import './button-group.css';

/**
 * LIMINAL · BUTTON GROUP
 *
 * Buttons that belong together, joined.
 *
 * IT IS NOT A TOOLBAR, and the difference is the keyboard. A toolbar is ONE tab
 * stop with arrow keys inside it, because its buttons are a set of commands over
 * one thing. A button group's buttons are independent actions — Save, Cancel,
 * Delete — and a reader who wants Delete should not have to arrow past Save to
 * reach it. So Tab moves between them, and the group only says that they belong
 * together.
 *
 * The JOINING is CSS, and the file is where the rule lives: the outer corners
 * round, the inner ones do not, and the seam between two buttons is a single
 * hairline rather than two edges meeting.
 *
 *   role        `control` — the group is a control surface, and it says so.
 *   tokens      zero raw values.
 *   a11y        `role="group"` with a required label; the buttons keep their own
 *               semantics and their own tab stops.
 *   RTL         the corner rules are logical, so the group rounds correctly in
 *               both directions without a second component.
 *   fixture     one row.
 */
export interface ButtonGroupProps {
  children?: ReactNode;
  /** Required: a group of controls with no name is a group a reader cannot describe. */
  label: string;
  /** Stack them instead of joining them side by side. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: CSSProperties;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { children, label, orientation = 'horizontal', className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  return (
    <div
      ref={forwardedRef}
      role="group"
      aria-label={label}
      className={className ? `liminal-button-group ${className}` : 'liminal-button-group'}
      data-orientation={orientation}
      style={{
        display: 'inline-flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        // The group sits in a WELL, so the buttons read as cut into something
        // rather than as floating in the page.
        ...resolveSurface({ role: 'well', on: host }).style,
        padding: 2,
        borderRadius: `${L.RADIUS.control}px`,
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
});

export default ButtonGroup;
