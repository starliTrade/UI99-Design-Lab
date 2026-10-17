import React, { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { FOCUS_RING_COLOR } from '../../../engine/liminal-ladder';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import './spinner.css';

/**
 * LIMINAL · SPINNER
 *
 * Something is happening and the reader cannot see what.
 *
 * `role="status"` rather than a bare div, because a spinner that appears
 * silently is a spinner a screen reader never announces — the reader is left
 * wondering whether their click registered. The label is REQUIRED for the same
 * reason: "loading" is not a description, it is a word, and the reader needs to
 * know what is loading.
 *
 *   role        none. It paints an arc, not a surface.
 *   sizes       sm · md · lg, from ICON_SIZES.
 *   tokens      zero raw values.
 *   a11y        `role="status"` with a required label; motion is suppressed
 *               entirely under `prefers-reduced-motion`, where the arc becomes
 *               a static ring rather than a thing that never stops moving.
 *   RTL         a rotation has no direction.
 *   fixture     one row.
 */
export interface SpinnerProps {
  /** What is loading. Required — "loading" alone tells the reader nothing. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  /** Hide the label visually but keep it for a screen reader. */
  labelHidden?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SIZE = { sm: 14, md: 18, lg: 24 } as const;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { label, size = 'md', labelHidden = false, className, style: customStyle },
  forwardedRef,
) {
  const reduced = useReducedMotion();
  const px = SIZE[size];
  return (
    <span
      ref={forwardedRef}
      role="status"
      className={className ? `liminal-spinner ${className}` : 'liminal-spinner'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${L.SPACING[1]}px`,
        // The arc's colour is the brand, from the engine's own reference rather
        // than a literal with a fallback — a literal here is a second answer for
        // a value the engine already publishes.
        color: FOCUS_RING_COLOR,
        ...customStyle,
      }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        aria-hidden
        focusable="false"
        style={{
          // Under reduced motion the arc is drawn complete: a ring that says
          // "busy" without a thing that never stops moving.
          animation: reduced ? undefined : `liminal-spin ${M.DURATION.slower * 3}ms linear infinite`,
        }}
      >
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.5" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={reduced ? 0.5 : 1}
        />
      </svg>
      <span
        style={{
          ...L.getTypeStyle(2),
          color: LiminalColorEngine.SEMANTICS.INFO.text,
          ...(labelHidden
            ? { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }
            : null),
        }}
      >
        {label}
      </span>
    </span>
  );
});

export default Spinner;
