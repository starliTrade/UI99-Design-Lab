import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Checkbox } from '../Checkbox';

/**
 * The Checkbox had no tests and no `error` state, while the other five inputs
 * had both. This is the state that was missing — a checkbox validates, and
 * "you must accept the terms" is a real error.
 */
describe('Checkbox — the error state', () => {
  it('says it is invalid, in ARIA and not only in colour', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I accept" error="You must accept the terms" />);
    const input = screen.getByRole('checkbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toBe(screen.getByText('You must accept the terms'));
  });

  it('announces the message, because it appeared after the reader acted', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I accept" error="You must accept the terms" />);
    expect(screen.getByRole('alert')).toBe(screen.getByText('You must accept the terms'));
  });

  it('the error REPLACES the description — one line, and it is the one that matters', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I accept" description="Terms apply" error="You must accept" />);
    expect(screen.queryByText('Terms apply')).toBeNull();
    expect(screen.getByText('You must accept')).toBeTruthy();
  });

  it('is not invalid when it is not', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I accept" />);
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBeNull();
  });
});
