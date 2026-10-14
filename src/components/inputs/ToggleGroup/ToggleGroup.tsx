import React, { forwardRef, useCallback, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { FOCUS_RING_COLOR } from '../../../engine/liminal-ladder';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · TOGGLE GROUP
 *
 * A set of toggles, and the two different things that can mean.
 *
 *   single    one of these is chosen. It is a radio group wearing buttons, and
 *             it says so: `role="radiogroup"` and `aria-checked`, so a screen
 *             reader announces the choice rather than a row of buttons.
 *   multiple  any number are on. It is a group of independent switches, and it
 *             says THAT: `role="group"` and `aria-pressed`.
 *
 * The distinction is not cosmetic. A single-select group announced as buttons
 * tells a screen reader nothing about the fact that choosing one un-chooses
 * another — the reader finds out by pressing. And the KEYBOARD differs: a radio
 * group is one tab stop with arrow keys, a group of switches is one stop per
 * switch, because they are independent things.
 *
 *   role        `control`, anchored on its host.
 *   sizes       sm · md · lg.
 *   variants    `type`: single · multiple — the policy, not the look.
 *   states      on · off · disabled.
 *   tokens      zero raw values.
 *   a11y        `radiogroup` + `aria-checked` for single, `group` +
 *               `aria-pressed` for multiple, and the keyboard that follows.
 *   RTL         logical properties only.
 *   fixture     one row.
 */
export interface ToggleGroupItem {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ToggleGroupProps {
  items: ToggleGroupItem[];
  type?: 'single' | 'multiple';
  /** A string for `single`, an array for `multiple`. */
  value: string | string[];
  onChange: (value: string | string[]) => void;
  size?: 'sm' | 'md' | 'lg';
  /** Required: a group of controls with no name is a group a reader cannot describe. */
  label: string;
  /**
   * The validation message.
   *
   * A single-select group is a required choice — "pick a view" — and the fixture
   * declared the state before the component had it. The agreement criterion is
   * what caught that, which is what it is for.
   */
  error?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const HEIGHT = { sm: 28, md: 34, lg: 42 } as const;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { items, type = 'single', value, onChange, size = 'md', label, error, disabled = false, className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const rootRef = useRef<HTMLDivElement | null>(null);
  // AN EMPTY STRING IS NOT A SELECTION.
  //
  // `value=""` is how a consumer says "nothing is chosen yet" — the same way an
  // empty Input says nothing is typed. Reading it as a selection left every
  // button at `tabIndex={-1}`: a radio group nothing could reach.
  const selected = (Array.isArray(value) ? value : [value]).filter((v) => v !== '');
  const single = type === 'single';

  const toggle = useCallback(
    (item: ToggleGroupItem) => {
      if (disabled || item.disabled) return;
      if (single) {
        onChange(item.value);
        return;
      }
      const list = Array.isArray(value) ? value : [];
      onChange(list.includes(item.value) ? list.filter((v) => v !== item.value) : [...list, item.value]);
    },
    [disabled, single, value, onChange],
  );

  /**
   * ARROW KEYS, ONLY FOR `single`.
   *
   * A radio group is one tab stop: the arrows move the choice. A group of
   * switches is one stop PER SWITCH, because they are independent things and a
   * reader may want to toggle the third without passing through the first two.
   * Applying one keyboard to both is how a group becomes unreachable.
   */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!single) return;
      const buttons = [...(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role=radio]') ?? [])].filter(
        (b) => !b.disabled,
      );
      const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (at < 0) return;
      const go = (next: number) => {
        e.preventDefault();
        const target = buttons[(next + buttons.length) % buttons.length];
        target?.focus();
        target?.click();
      };
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(at + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(at - 1);
    },
    [single],
  );

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      role={single ? 'radiogroup' : 'group'}
      aria-label={label}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${label}-error` : undefined}
      onKeyDown={onKeyDown}
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: `${L.SPACING[1]}px`,
        ...customStyle,
      }}
    >
      <div
        style={{
        display: 'inline-flex',
        gap: 2,
        padding: 2,
        borderRadius: `${L.RADIUS.control}px`,
        // The group sits in a WELL: the buttons are cut into it, which is what
        // makes a chosen one read as raised rather than as a different colour.
        ...resolveSurface({ role: 'well', on: host }).style,
      }}
      >
      {items.map((item, index) => {
        const on = selected.includes(item.value);
        const inert = disabled || item.disabled;
        // A radio group with NOTHING selected would be a group with every
        // button at `tabIndex={-1}` — unreachable by keyboard. The first one
        // takes the stop.
        const tabbable = single ? (selected.length === 0 ? index === 0 : on) : true;
        return (
          <button
            key={item.value}
            type="button"
            // The attribute follows the ROLE, not the look.
            role={single ? 'radio' : undefined}
            aria-checked={single ? on : undefined}
            aria-pressed={single ? undefined : on}
            disabled={inert}
            // A radio group is ONE tab stop; the arrows move within it.
            tabIndex={tabbable ? 0 : -1}
            onClick={() => toggle(item)}
            data-liminal-surface=""
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${L.SPACING[1]}px`,
              minHeight: HEIGHT[size],
              padding: `0 ${L.SPACING[3]}px`,
              border: 'none',
              borderRadius: `${L.RADIUS.chip}px`,
              cursor: inert ? 'not-allowed' : 'pointer',
              opacity: inert ? 0.5 : 1,
              ...L.getTypeStyle(2),
              color: on ? getTextStyle('primary', 2).color : getTextStyle('secondary', 2).color,
              fontWeight: on ? 600 : 400,
              transition: M.getTransition('background', 'fast'),
              ...resolveInteractionVars({
                role: 'control',
                on: host,
                // A CHOSEN toggle keeps its fill in every state — the rule a
                // checked control follows. An unchosen one is transparent, so
                // the well behind it shows through.
                idle: on ? FOCUS_RING_COLOR : 'transparent',
                frozen: on ? FOCUS_RING_COLOR : undefined,
              }),
              ...(on ? { color: getTextStyle('primary', 2).color } : null),
            }}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
      </div>
      {error && (
        <span id={`${label}-error`} role="alert" style={{ ...L.getTypeStyle(1), color: SEMANTICS.DANGER.text }}>
          {error}
        </span>
      )}
    </div>
  );
});

export default ToggleGroup;
