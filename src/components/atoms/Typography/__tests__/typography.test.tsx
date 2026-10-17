import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Text, Heading } from '../Typography';
import { LiminalLayoutEngine as L } from '../../../../engine/liminal-layout-engine';

/**
 * The one thing these components exist to keep separate: the DOCUMENT OUTLINE
 * and the VISUAL SIZE.
 */
describe('Text', () => {
  it('renders a paragraph by default, at the scale step asked for', () => {
    render(<Text level={3}>Body</Text>);
    const el = screen.getByText('Body');
    expect(el.tagName).toBe('P');
    expect(el.style.fontSize).toBe(L.getTypeSizeCss(3));
  });

  it('takes the element independently of the size', () => {
    // A span that looks like body copy is still a span.
    render(<Text as="span" level={2}>Inline</Text>);
    const el = screen.getByText('Inline');
    expect(el.tagName).toBe('SPAN');
    expect(el.style.fontSize).toBe(L.getTypeSizeCss(2));
  });

  it('uses a rem-based size, so the reader’s own font-size is honoured', () => {
    // WCAG 1.4.4. A px type scale ignores the browser preference; this is a
    // fluid clamp over a rem base.
    render(<Text level={3}>Body</Text>);
    expect(L.getTypeSizeCss(3)).toContain('var(--liminal-type-base)');
  });
});

describe('Heading', () => {
  it('renders the DOCUMENT level as the element', () => {
    render(<Heading level={2}>Title</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeTruthy();
  });

  it('defaults the visual size from the document level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole('heading', { level: 1 }).style.fontSize).toBe(L.getTypeSizeCss(7));
    render(<Heading level={2}>Smaller</Heading>);
    expect(screen.getByRole('heading', { level: 2 }).style.fontSize).toBe(L.getTypeSizeCss(6));
  });

  it('lets the size OVERRIDE, because a card’s h3 is not the page’s h3', () => {
    // Forcing the outline and the size to agree is how a heading level ends up
    // chosen for its size — which is a heading level chosen for the wrong reason.
    render(<Heading level={3} size={4}>Card title</Heading>);
    const el = screen.getByRole('heading', { level: 3 });
    expect(el.style.fontSize).toBe(L.getTypeSizeCss(4));
  });

  it('is a real heading, so the outline exists for a screen reader', () => {
    render(<Heading level={4}>Section</Heading>);
    expect(screen.getByRole('heading', { level: 4 })).toBeTruthy();
  });
});
