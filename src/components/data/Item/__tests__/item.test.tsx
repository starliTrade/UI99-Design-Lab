import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Item } from '../Item';
import { Marker } from '../../../atoms/Marker/Marker';

/**
 * The element is not a style decision. Four places in this library had built the
 * same row by hand and each had picked its own element and its own ARIA.
 */
describe('Item — it renders the element the row actually is', () => {
  it('a row that navigates is a LINK', () => {
    render(<Item href="/inbox">Inbox</Item>);
    expect(screen.getByRole('link', { name: 'Inbox' })).toBeTruthy();
  });

  it('a row that acts is a BUTTON', () => {
    render(<Item onClick={() => {}}>Archive</Item>);
    expect(screen.getByRole('button', { name: 'Archive' })).toBeTruthy();
  });

  it('a row that only shows something is NOT a control', () => {
    // Making it focusable would be a tab stop that does nothing.
    const { container } = render(<Item>Total</Item>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('reports the click', () => {
    const onClick = vi.fn();
    render(<Item onClick={onClick}>Archive</Item>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('a disabled link does not navigate', () => {
    const { container } = render(<Item href="/x" disabled>Inbox</Item>);
    const link = container.querySelector('a')!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('Item — `selected` is about the CONTEXT, not the look', () => {
  it('`option` announces it as chosen, for a listbox', () => {
    render(<Item onClick={() => {}} selected="option">Inbox</Item>);
    expect(screen.getByRole('button').getAttribute('aria-selected')).toBe('true');
  });

  it('`page` announces it as where you ARE, for navigation', () => {
    // Guessing wrong tells a screen reader the row is chosen when it is merely
    // where you are.
    render(<Item href="/inbox" selected="page">Inbox</Item>);
    expect(screen.getByRole('link').getAttribute('aria-current')).toBe('page');
  });

  it('`none` announces nothing, for a row that is merely highlighted', () => {
    render(<Item onClick={() => {}}>Inbox</Item>);
    const el = screen.getByRole('button');
    expect(el.getAttribute('aria-selected')).toBeNull();
    expect(el.getAttribute('aria-current')).toBeNull();
  });
});

describe('Item — the row opts in AND publishes', () => {
  it('does both, so the layer paints it', () => {
    const { container } = render(<Item onClick={() => {}}>Inbox</Item>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-liminal-surface')).toBe(true);
    expect(el.style.getPropertyValue('--liminal-surface-idle')).toBeTruthy();
  });
});

describe('Marker — text, not a chip', () => {
  it('is inline, so it is read as part of the phrase it marks', () => {
    // "Inbox 12" is one phrase. A screen reader that pauses between them has
    // read two.
    render(<Item onClick={() => {}} end={<Marker muted>12</Marker>}>Inbox</Item>);
    expect(screen.getByText('12').tagName).toBe('SPAN');
  });

  it('takes a semantic colour when it carries meaning', () => {
    render(<Marker semantic="danger">3</Marker>);
    expect(screen.getByText('3')).toBeTruthy();
  });
});
