import React, { forwardRef, useCallback, useId, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · COLLAPSIBLE
 *
 * A region the reader opens and closes, with a trigger that says which.
 *
 * `aria-expanded` on the trigger and `aria-controls` pointing at the region —
 * both, because a screen reader needs to know the state AND what it applies to.
 * A disclosure with only `aria-expanded` is a state with no object.
 *
 * It is NOT an Accordion. An accordion is a SET of these with a rule about how
 * many may be open; that rule is a different component, and folding it in here
 * would make every single disclosure carry the policy of a group.
 *
 *   role        `work` — the region is a surface the reader works in.
 *   sizes       none.
 *   states      open · closed · disabled.
 *   tokens      zero raw values.
 *   a11y        a real `<button>` trigger with `aria-expanded` and
 *               `aria-controls`; the region is labelled by the trigger.
 *   RTL         the chevron is a logical rotation.
 *   fixture     one row.
 */
export interface CollapsibleProps {
  /** The trigger's label. */
  title: string;
  children?: ReactNode;
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { title, children, open: controlledOpen, defaultOpen = false, onOpenChange, disabled = false, className, style: customStyle },
  forwardedRef,
) {
  const id = useId();
  const regionId = `${id}-region`;
  const triggerId = `${id}-trigger`;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const host = useHostSurface();
  const surface = resolveSurface({ role: 'work', on: host });

  return (
    <div ref={forwardedRef} className={className} style={{ ...surface.style, borderRadius: `${L.RADIUS.card}px`, minWidth: 0, ...customStyle }}>
      <button
        type="button"
        id={triggerId}
        // BOTH. `aria-expanded` is the state; `aria-controls` is what it applies
        // to. A disclosure with only the first is a state with no object.
        aria-expanded={isOpen}
        aria-controls={regionId}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!isOpen)}
        data-liminal-surface=""
        style={{
          ...L.getTypeStyle(2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${L.SPACING[2]}px`,
          width: '100%',
          padding: `${L.SPACING[3]}px`,
          border: 'none',
          borderRadius: `${L.RADIUS.card}px`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          color: getTextStyle('primary', 2).color,
          textAlign: 'start',
          ...resolveInteractionVars({ role: 'control', on: host, idle: 'transparent' }),
        }}
      >
        <span>{title}</span>
        <span
          aria-hidden
          style={{
            transition: M.getTransition('transform', 'fast'),
            transform: isOpen ? 'rotate(180deg)' : 'none',
            color: getTextStyle('tertiary', 1).color,
            fontSize: 10,
          }}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div id={regionId} role="region" aria-labelledby={triggerId} style={{ padding: `${L.SPACING[3]}px` }}>
          {children}
        </div>
      )}
    </div>
  );
});

export default Collapsible;
