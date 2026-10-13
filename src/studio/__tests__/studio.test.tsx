import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Studio } from '../Studio';
import { toJsx } from '../panels';
import { createLiminalTheme } from '../../engine/liminal-theme';
import { LADDER } from '../../engine/liminal-ladder';

/**
 * The studio is a TOOL, and a tool that silently stops working is worse than no
 * tool: a reviewer would read an empty panel as "nothing to report".
 *
 * These assertions are deliberately about the studio's own contract — that the
 * panels exist, that the serialiser names the real component, and that the
 * theme function it uses is the engine's own.
 */
describe('the studio', () => {
  it('renders every panel it promises', () => {
    render(<Studio />);
    for (const label of ['تم', 'پیش‌نمایش', 'موتور', 'قرارداد', 'پوشش', 'کد']) {
      expect(screen.getByLabelText(label), label).toBeTruthy();
    }
  });

  it('carries the theme scope the generated block is written for', () => {
    const { container } = render(<Studio />);
    expect(container.querySelector('[data-liminal-theme="studio"]')).toBeTruthy();
  });

  it('offers a control for every kind of choice the fixture table declares', () => {
    const { container } = render(<Studio />);
    // Button has sizes, states and variants — so three groups of buttons.
    const pressed = container.querySelectorAll('[aria-pressed]');
    expect(pressed.length).toBeGreaterThan(8);
  });
});

describe('the JSX serialiser', () => {
  it('names the real component, not "Component"', () => {
    // `forwardRef` wraps the component in an object, so `type.name` is
    // undefined and the panel printed "Component" for every one of them.
    const El = React.forwardRef<HTMLButtonElement, { label: string }>(({ label }, ref) => (
      <button ref={ref}>{label}</button>
    ));
    El.displayName = 'Forwarded';
    expect(toJsx(<El label="سلام" />)).toContain('<Forwarded');
  });

  it('writes a string prop as a string and a number as an expression', () => {
    const jsx = toJsx(<div title="سلام" data-n={3} />);
    expect(jsx).toContain('title="سلام"');
    expect(jsx).toContain('data-n={3}');
  });

  it('elides children deeper than one level rather than guessing', () => {
    const jsx = toJsx(
      <div>
        <span>
          <b>deep</b>
        </span>
      </div>,
    );
    expect(jsx).toContain('…');
  });
});

describe('the theme the studio uses is the engine’s own', () => {
  it('generates a ladder that differs from the system one', () => {
    const t = createLiminalTheme({ brandHue: 20, name: 'studio' });
    expect(t.ladder).not.toEqual(LADDER);
    expect(t.css).toContain('[data-liminal-theme="studio"]');
  });

  it('reports the steps a hue cannot hold instead of failing silently', () => {
    const t = createLiminalTheme({ brandHue: 20, brandChroma: 0.03, name: 'studio' });
    expect(Array.isArray(t.warnings)).toBe(true);
    for (const w of t.warnings) expect(['below-quantum', 'above-band']).toContain(w.kind);
  });
});
