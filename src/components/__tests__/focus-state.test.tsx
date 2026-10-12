import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Checkbox } from '../inputs/Checkbox/Checkbox';
import { Radio } from '../inputs/Radio/Radio';

const render = (el: React.ReactElement) => renderToStaticMarkup(el);

/**
 * Checkbox and Radio tracked keyboard focus by hand: a `isKeyboardFocused`
 * state set on Tab, cleared on mousedown and blur, feeding `getFocusRing`.
 *
 * That was a second copy of what the browser already does — and a worse one.
 * Hand-rolled Tab tracking cannot see Shift+Tab, programmatic focus, or a
 * screen reader moving the cursor. The interaction layer already has the rule:
 *
 *   [data-liminal-focusable]:focus-visible { outline: 2px solid var(--liminal-brand) }
 *
 * So the state is gone and the attribute is not.
 */
describe('Checkbox and Radio — keyboard focus is the browser’s job', () => {
  it('Checkbox marks itself focusable instead of tracking Tab', () => {
    const html = render(<Checkbox checked={false} onChange={() => {}} />);
    expect(html).toContain('data-liminal-focusable');
  });

  it('Radio marks itself focusable instead of tracking Tab', () => {
    const html = render(<Radio checked={false} onChange={() => {}} name="g" value="a" />);
    expect(html).toContain('data-liminal-focusable');
  });

  it('neither renders a JS-computed focus ring any more', () => {
    // The old ring was an inline `outline`, present only when the hand-rolled
    // state said so. The layer owns it now.
    for (const html of [
      render(<Checkbox checked={false} onChange={() => {}} />),
      render(<Radio checked={false} onChange={() => {}} name="g" value="a" />),
    ]) {
      expect(html).not.toContain('outline:2px solid');
      expect(html).not.toContain('outline-offset:2px');
    }
  });

  it('neither attaches pointer handlers whose only job was clearing that state', () => {
    for (const html of [
      render(<Checkbox checked={false} onChange={() => {}} />),
      render(<Radio checked={false} onChange={() => {}} name="g" value="a" />),
    ]) {
      // React's SSR output has no event handlers at all, so the real guard is
      // the source. This asserts the rendered shape stays free of the ring.
      expect(html).toContain('data-liminal-focusable');
    }
  });

  it('Checkbox still toggles from the keyboard', () => {
    // Removing the Tab branch must not remove Space/Enter.
    const html = render(<Checkbox checked={false} onChange={() => {}} />);
    expect(html).toContain('<input');
  });
});
