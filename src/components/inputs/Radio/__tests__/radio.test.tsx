import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Radio } from '../Radio';

describe('Radio — the error state', () => {
  it('says it is invalid, in ARIA and not only in colour', () => {
    render(<Radio checked={false} onChange={() => {}} name="plan" value="a" label="Option" error="Choose one" />);
    const input = screen.getByRole('radio');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toBe(screen.getByText('Choose one'));
  });

  it('announces the message', () => {
    render(<Radio checked={false} onChange={() => {}} name="plan" value="a" label="Option" error="Choose one" />);
    expect(screen.getByRole('alert')).toBe(screen.getByText('Choose one'));
  });

  it('is not invalid when it is not', () => {
    render(<Radio checked={false} onChange={() => {}} name="plan" value="a" label="Option" />);
    expect(screen.getByRole('radio').getAttribute('aria-invalid')).toBeNull();
  });
});
