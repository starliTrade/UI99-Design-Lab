import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Studio } from '../Studio';
import { ThemeProvider } from '../../docs/theme';
import { toJsx } from '../../docs/ui';
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
    render(<ThemeProvider><Studio /></ThemeProvider>);
    for (const label of ['Theme', 'Preview', 'Engine', 'Contract', 'Coverage', 'Code']) {
      expect(screen.getByLabelText(label), label).toBeTruthy();
    }
  });

  it('reads the theme from the provider instead of keeping its own copy', () => {
    // A studio with a private theme would theme itself and nothing else.
    const { container } = render(<ThemeProvider><Studio /></ThemeProvider>);
    expect(container.querySelector('[data-liminal-theme="liminal"]')).toBeTruthy();
  });

  it('offers a control for every kind of choice the fixture table declares', () => {
    const { container } = render(<ThemeProvider><Studio /></ThemeProvider>);
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
  it('carries the engine’s ladder, because the identity is not a setting', () => {
    const t = createLiminalTheme({ name: 'studio' });
    expect(t.ladder).toEqual([...LADDER]);
    expect(t.css).toContain('[data-liminal-theme="studio"]');
  });

  it('clamps a density that would break the touch floor, and says so', () => {
    const t = createLiminalTheme({ density: 0.8, name: 'studio' });
    expect(t.density).toBeGreaterThan(0.8);
    expect(t.warnings.some((w) => w.scale === 'density')).toBe(true);
  });
});
