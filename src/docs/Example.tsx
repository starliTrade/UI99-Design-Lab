/**
 * LIMINAL · DOCS — AN EXAMPLE
 *
 * The unit a component page is made of, and the shape shadcn's site uses: a
 * live preview, and the code BEHIND A TOGGLE.
 *
 * The toggle is not a nicety. A page that shows the code for every example at
 * once is a page nobody reads — the eye has to skip past twelve code blocks to
 * find the twelfth example. Closed by default, opened when asked.
 *
 * The code is the element the fixture returned, walked — not a string written
 * here. An example whose code does not match its preview is worse than no code.
 */
import React, { useState } from 'react';
import { resolveSurface } from '../engine/liminal-surface';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../engine/liminal-motion-engine';
import { getTextStyle } from '../engine/spec-engine';
import { toJsx, MONO, S, R } from './ui';

const WELL = resolveSurface({ role: 'well', interactive: false });
const CHROME = resolveSurface({ role: 'chrome', interactive: false });

export function Example({
  title,
  note,
  children,
  element,
  /** The code to show. Omitted, the example has no code to reveal. */
  code,
}: {
  title?: string;
  note?: string;
  children: React.ReactNode;
  element?: React.ReactElement;
  code?: string;
}) {
  const [open, setOpen] = useState(false);
  const source = code ?? (element ? toJsx(element) : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px`, minWidth: 0 }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{title}</span>
          {note && <span style={{ fontSize: 11, opacity: 0.6 }}>{note}</span>}
        </div>
      )}

      {/* The preview. A well, because the example is something the reader looks
          INTO rather than at — the same rule the engine applies to a code block. */}
      <div
        style={{
          ...WELL.style,
          borderRadius: `${R.card}px`,
          padding: `${S[5]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 96,
          overflowX: 'auto',
        }}
      >
        {children}
      </div>

      {source && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{
              ...CHROME.style,
              alignSelf: 'flex-start',
              font: 'inherit',
              fontSize: 11,
              padding: `${S[0]}px ${S[2]}px`,
              borderRadius: `${R.chip}px`,
              border: 'none',
              cursor: 'pointer',
              color: getTextStyle('secondary', 1).color,
              transition: M.getTransition('background', 'fast'),
            }}
          >
            {open ? 'Hide code' : 'View code'}
          </button>
          {open && (
            <pre
              style={{
                ...WELL.style,
                margin: 0,
                borderRadius: `${R.card}px`,
                padding: `${S[3]}px`,
                fontFamily: MONO,
                fontSize: 11,
                direction: 'ltr',
                textAlign: 'left',
                overflowX: 'auto',
                whiteSpace: 'pre',
                color: getTextStyle('secondary', 1).color,
              }}
            >
              {source}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
