import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NumberInput } from '../NumberInput';

describe('NumberInput — the props reach the Input underneath', () => {
  // The lesson it was built with. `DatePicker` wraps an `Input` and never passed
  // `error` through: a prop that stopped one layer short, invisible until
  // something downstream needed it. Every prop is asserted here.
  it('passes the error through, with its ARIA', () => {
    render(<NumberInput value={12} onChange={() => {}} label="Quantity" error="Out of range" />);
    const input = screen.getByLabelText('Quantity');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Out of range')).toBeTruthy();
  });

  it('passes the size through — a size that stops at the wrapper is not a size', () => {
    const { container } = render(<NumberInput value={12} onChange={() => {}} label="Quantity" size="lg" />);
    const wrapper = container.querySelector('[data-liminal-surface]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe('52px'); // CONTROL.lg
  });

  it('passes disabled through, and the steppers go with it', () => {
    render(<NumberInput value={12} onChange={() => {}} label="Quantity" disabled />);
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Increase' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Decrease' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('passes helperText through', () => {
    render(<NumberInput value={12} onChange={() => {}} label="Quantity" helperText="Up to 99" />);
    expect(screen.getByText('Up to 99')).toBeTruthy();
  });
});

describe('NumberInput — the value', () => {
  it('is a spinbutton, with the arrow keys the platform already gives it', () => {
    render(<NumberInput value={12} onChange={() => {}} label="Quantity" />);
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeTruthy();
  });

  it('reports a NUMBER, not a string', () => {
    const onChange = vi.fn();
    render(<NumberInput value={12} onChange={onChange} label="Quantity" />);
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '30' } });
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('an EMPTY field stays empty — a cleared box is not a zero', () => {
    // Coercing '' to 0 is how a reader who cleared the box to retype gets a
    // zero they never asked for.
    const onChange = vi.fn();
    render(<NumberInput value={12} onChange={onChange} label="Quantity" />);
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('clamps to min and max, from typing and from the steppers', () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberInput value={12} onChange={onChange} label="Quantity" min={0} max={20} />);
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '99' } });
    expect(onChange).toHaveBeenLastCalledWith(20);

    onChange.mockClear();
    rerender(<NumberInput value={20} onChange={onChange} label="Quantity" min={0} max={20} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(20);
  });

  it('the steppers step by the step', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} label="Quantity" step={0.5} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(10.5);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenLastCalledWith(9.5);
  });

  it('a read-only field does not step', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} label="Quantity" readOnly />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('NumberInput — the steppers are reachable', () => {
  it('each stepper is a named button, not a glyph', () => {
    render(<NumberInput value={12} onChange={() => {}} label="Quantity" />);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeTruthy();
  });

  it('each stepper is at least 24px — WCAG 2.5.8, the secondary-target floor', () => {
    render(<NumberInput value={12} onChange={() => {}} label="Quantity" />);
    const btn = screen.getByRole('button', { name: 'Increase' });
    expect(btn.style.width).toBe('24px');
    expect(btn.style.height).toBe('24px');
  });
});
