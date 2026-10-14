import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Accordion } from '../Accordion/Accordion';

const ITEMS = [
  { id: 'one', title: 'Shipping', content: <span>Two to five days.</span> },
  { id: 'two', title: 'Returns', content: <span>Thirty days.</span> },
  { id: 'three', title: 'Payment', content: <span>Cards and transfers.</span> },
];

/**
 * An accordion is a SET, and the set is the whole component: the policy about
 * how many may be open, the headings that make it navigable, and the arrow keys
 * that make it one stop instead of four.
 */
describe('Accordion — the triggers are headings', () => {
  it('wraps every trigger in a heading, because that is how a screen reader moves between them', () => {
    render(<Accordion items={ITEMS} />);
    for (const item of ITEMS) {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeTruthy();
    }
  });

  it('honours headingLevel — a heading level is a document decision, not a component one', () => {
    render(<Accordion items={ITEMS} headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Shipping' })).toBeTruthy();
  });
});

describe('Accordion — the policy', () => {
  it('`single` closes the others when one opens', () => {
    render(<Accordion items={ITEMS} type="single" />);
    fireEvent.click(screen.getByRole('button', { name: /Shipping/ }));
    expect(screen.getByRole('button', { name: /Shipping/ }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /Returns/ }));
    expect(screen.getByRole('button', { name: /Shipping/ }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('button', { name: /Returns/ }).getAttribute('aria-expanded')).toBe('true');
  });

  it('`multiple` lets the reader open what they want', () => {
    render(<Accordion items={ITEMS} type="multiple" />);
    fireEvent.click(screen.getByRole('button', { name: /Shipping/ }));
    fireEvent.click(screen.getByRole('button', { name: /Returns/ }));
    expect(screen.getByRole('button', { name: /Shipping/ }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: /Returns/ }).getAttribute('aria-expanded')).toBe('true');
  });

  it('reports the open set', () => {
    const onOpenChange = vi.fn();
    render(<Accordion items={ITEMS} type="multiple" onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Returns/ }));
    expect(onOpenChange).toHaveBeenCalledWith(['two']);
  });
});

describe('Accordion — one stop, and the arrows do the rest', () => {
  it('↓ moves to the next trigger', () => {
    render(<Accordion items={ITEMS} />);
    const first = screen.getByRole('button', { name: /Shipping/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Returns/ }));
  });

  it('↑ moves back, and wraps', () => {
    render(<Accordion items={ITEMS} />);
    const first = screen.getByRole('button', { name: /Shipping/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Payment/ }));
  });

  it('Home and End go to the ends', () => {
    render(<Accordion items={ITEMS} />);
    const first = screen.getByRole('button', { name: /Shipping/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Payment/ }));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Shipping/ }));
  });

  it('skips a disabled trigger', () => {
    render(<Accordion items={[{ ...ITEMS[0] }, { ...ITEMS[1], disabled: true }, { ...ITEMS[2] }]} />);
    const first = screen.getByRole('button', { name: /Shipping/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Payment/ }));
  });
});
