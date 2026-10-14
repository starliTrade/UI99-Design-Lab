import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MessageScroller } from '../MessageScroller';

/**
 * jsdom has no layout: `scrollHeight` and `clientHeight` are 0, so the scroll
 * BEHAVIOUR cannot be tested here and is checked in a browser. What can be
 * tested is the structure — and the structure is where the accessibility lives.
 */
describe('MessageScroller — a scrollable region a keyboard can scroll', () => {
  it('is focusable AND named, because a scrollable region is a tab stop', () => {
    // A div with `overflow: auto` is scrollable by pointer and by nothing else.
    // WCAG 2.1.1 is explicit.
    render(<MessageScroller label="Conversation"><span>Hi</span></MessageScroller>);
    const region = screen.getByRole('log', { name: 'Conversation' });
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  it('is a log, so arrivals are announced without stealing focus', () => {
    render(<MessageScroller label="Conversation"><span>Hi</span></MessageScroller>);
    expect(screen.getByRole('log')).toBeTruthy();
  });

  it('takes a step from the scale for its height, not a number', () => {
    const { container } = render(<MessageScroller label="Conversation" maxHeight={6}><span>Hi</span></MessageScroller>);
    expect((container.querySelector('[role=log]') as HTMLElement).style.maxHeight).toBe('32px');
  });
});

describe('MessageScroller — the return button appears only when it does something', () => {
  it('is NOT there when the reader is at the bottom', () => {
    // A button that is always present and usually does nothing is a button the
    // reader stops reading.
    render(<MessageScroller label="Conversation"><span>Hi</span></MessageScroller>);
    expect(screen.queryByRole('button', { name: 'Jump to latest' })).toBeNull();
  });

  it('appears when the reader has scrolled away from the bottom', () => {
    render(<MessageScroller label="Conversation"><span>Hi</span></MessageScroller>);
    const region = screen.getByRole('log');
    // jsdom reports 0 for every measurement, so "scrolled up" is simulated by
    // making the geometry say so.
    Object.defineProperty(region, 'scrollHeight', { value: 400, configurable: true });
    Object.defineProperty(region, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(region, 'scrollTop', { value: 0, configurable: true, writable: true });
    fireEvent.scroll(region);
    expect(screen.getByRole('button', { name: 'Jump to latest' })).toBeTruthy();
  });

  it('the button is named, and returns to the bottom', () => {
    render(<MessageScroller label="Conversation"><span>Hi</span></MessageScroller>);
    const region = screen.getByRole('log');
    Object.defineProperty(region, 'scrollHeight', { value: 400, configurable: true });
    Object.defineProperty(region, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(region, 'scrollTop', { value: 0, configurable: true, writable: true });
    fireEvent.scroll(region);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to latest' }));
    expect(region.scrollTop).toBe(400);
  });

  it('takes a custom label, because the words are the product’s', () => {
    render(<MessageScroller label="Conversation" jumpLabel="New messages"><span>Hi</span></MessageScroller>);
    const region = screen.getByRole('log');
    Object.defineProperty(region, 'scrollHeight', { value: 400, configurable: true });
    Object.defineProperty(region, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(region, 'scrollTop', { value: 0, configurable: true, writable: true });
    fireEvent.scroll(region);
    expect(screen.getByRole('button', { name: 'New messages' })).toBeTruthy();
  });
});
