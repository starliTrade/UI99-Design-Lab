import React, { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · ITEM
 *
 * A row in a list: something at the start, a label, and something at the end.
 *
 * IT RENDERS THE ELEMENT THE ROW ACTUALLY IS, and that is the whole component.
 * Four places in this library had built the same row by hand — a tree node, a
 * menu item, a message, a nav link — and each had picked its own element and its
 * own ARIA. The element is not a style decision:
 *
 *   href        an `<a>`. A row that navigates is a link, and a screen reader
 *               announces it as one.
 *   onClick     a `<button>`. A row that acts is a button.
 *   neither     a plain row. A row that only shows something is not a control,
 *               and making it focusable is a tab stop that does nothing.
 *
 * `selected` maps to the attribute the CONTEXT uses: `aria-selected` inside a
 * listbox, `aria-current` inside navigation. Guessing wrong tells a screen reader
 * the row is chosen when it is merely where you are — so it is a prop.
 *
 *   role        `control` when it acts, `work` when it only shows.
 *   sizes       sm · md · lg.
 *   states      default · hover · selected · disabled.
 *   tokens      zero raw values.
 *   a11y        the element follows the behaviour; `selected` is announced with
 *               the attribute the context expects.
 *   RTL         logical properties only.
 *   fixture     one row.
 */
export interface ItemProps {
  children?: ReactNode;
  /** Rendered before the label. */
  start?: ReactNode;
  /** Rendered after the label, at the far edge. */
  end?: ReactNode;
  /** A second line under the label. */
  description?: string;
  /** Renders an `<a>`. */
  href?: string;
  /** Renders a `<button>`. */
  onClick?: () => void;
  /**
   * How to announce "this is the chosen one".
   *
   * `option` for a listbox, `page` for navigation, `none` for a row that is
   * merely highlighted. It is a prop because the answer is about the CONTEXT,
   * and the component cannot see it.
   */
  selected?: 'option' | 'page' | 'none';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

const HEIGHT = { sm: 28, md: 34, lg: 42 } as const;

export const Item = forwardRef<HTMLElement, ItemProps>(function Item(
  { children, start, end, description, href, onClick, selected = 'none', disabled = false, size = 'md', className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  const acts = Boolean(href || onClick);
  const surface = resolveSurface({ role: acts ? 'control' : 'work', on: host });
  const Tag = href ? 'a' : onClick ? 'button' : 'div';

  const chosen = selected !== 'none';
  const style: CSSProperties = {
    // The row opts into the layer AND publishes, so hover and press come from
    // the engine rather than from a second implementation.
    ...resolveInteractionVars({
      role: acts ? 'control' : 'work',
      on: host,
      idle: chosen ? resolveSurface({ role: 'well', on: host }).background : 'transparent',
      // A CHOSEN row keeps its fill in every state — the rule a checked control
      // follows. A row that only shows something has no states to keep.
      frozen: chosen ? resolveSurface({ role: 'well', on: host }).background : undefined,
    }),
    display: 'flex',
    alignItems: 'center',
    gap: `${L.SPACING[2]}px`,
    width: '100%',
    minHeight: HEIGHT[size],
    paddingInline: `${L.SPACING[2]}px`,
    borderRadius: `${L.RADIUS.chip}px`,
    border: 'none',
    boxSizing: 'border-box',
    textAlign: 'start',
    textDecoration: 'none',
    font: 'inherit',
    cursor: disabled ? 'not-allowed' : acts ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    transition: M.getTransition('background', 'fast'),
    ...customStyle,
  };

  const body = (
    <>
      {start && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{start}</span>}
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span
          style={{
            ...L.getTypeStyle(2),
            color: chosen ? getTextStyle('primary', 2).color : getTextStyle('secondary', 2).color,
            fontWeight: chosen ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {children}
        </span>
        {description && (
          <span style={{ ...L.getTypeStyle(1), color: getTextStyle('tertiary', 1).color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {description}
          </span>
        )}
      </span>
      {end && <span style={{ display: 'inline-flex', flexShrink: 0, marginInlineStart: 'auto' }}>{end}</span>}
    </>
  );

  const shared = {
    ref: forwardedRef as React.Ref<never>,
    className,
    'data-liminal-surface': '',
    'aria-selected': selected === 'option' ? chosen : undefined,
    'aria-current': (selected === 'page' && chosen ? 'page' : undefined) as 'page' | undefined,
    'aria-disabled': disabled || undefined,
    style,
  };

  if (Tag === 'a') {
    return (
      <a {...shared} href={href} onClick={disabled ? (e) => e.preventDefault() : undefined}>
        {body}
      </a>
    );
  }
  if (Tag === 'button') {
    return (
      <button {...shared} type="button" disabled={disabled} onClick={onClick}>
        {body}
      </button>
    );
  }
  return <div {...shared}>{body}</div>;
});

export default Item;
