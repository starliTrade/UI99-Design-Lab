import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Rating } from '../Rating';

/**
 * A rating is a CHOICE FROM A SET, so it is a radio group. The tests are about
 * what a group of buttons would fail to do.
 */
describe('Rating — it is a radio group, not five buttons', () => {
  it('is ONE control with a name, not five unrelated buttons', () => {
    render(<Rating value={0} onChange={() => {}} label="How was it?" />);
    expect(screen.getByRole('group', { name: 'How was it?' })).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('each star says which value it is', () => {
    render(<Rating value={0} onChange={() => {}} label="How was it?" />);
    expect(screen.getByRole('radio', { name: '3 of 5' })).toBeTruthy();
  });

  it('reports which one is CHOSEN, which a button cannot', () => {
    render(<Rating value={3} onChange={() => {}} label="How was it?" />);
    expect((screen.getByRole('radio', { name: '3 of 5' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('radio', { name: '4 of 5' }) as HTMLInputElement).checked).toBe(false);
  });

  it('is a native radio group, so the arrow keys work without a handler', () => {
    // Five buttons would need a roving-tabindex implementation. A radio group
    // gets it from the platform.
    render(<Rating value={0} onChange={() => {}} label="How was it?" />);
    for (const r of screen.getAllByRole('radio')) {
      expect((r as HTMLInputElement).type).toBe('radio');
      expect((r as HTMLInputElement).name).toBeTruthy();
    }
  });
});

describe('Rating — the value', () => {
  it('reports a NUMBER', () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChange={onChange} label="How was it?" />);
    fireEvent.click(screen.getByRole('radio', { name: '4 of 5' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('zero means nothing chosen, and nothing is checked', () => {
    render(<Rating value={0} onChange={() => {}} label="How was it?" />);
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });

  it('read-only does not change the value', () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} readOnly label="How was it?" />);
    fireEvent.click(screen.getByRole('radio', { name: '5 of 5' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled does not change the value', () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} disabled label="How was it?" />);
    fireEvent.click(screen.getByRole('radio', { name: '5 of 5' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('honours max', () => {
    render(<Rating value={0} onChange={() => {}} max={10} label="How was it?" />);
    expect(screen.getAllByRole('radio')).toHaveLength(10);
  });
});

describe('Rating — the error state', () => {
  it('announces the message and points the group at it', () => {
    render(<Rating value={0} onChange={() => {}} label="How was it?" error="Choose a rating" />);
    const group = screen.getByRole('group', { name: 'How was it?' });
    const id = group.getAttribute('aria-describedby');
    expect(document.getElementById(id!)).toBe(screen.getByText('Choose a rating'));
    expect(screen.getByRole('alert')).toBe(screen.getByText('Choose a rating'));
  });
});

describe('Rating — the targets are reachable', () => {
  it('every star is at least 24px — WCAG 2.5.8', () => {
    // jsdom has no layout, so `getBoundingClientRect` is 0 for everything. The
    // declared size is what can be asserted here; the rendered size is checked
    // in the browser, and both are needed.
    render(<Rating value={0} onChange={() => {}} size="sm" label="How was it?" />);
    for (const label of document.querySelectorAll('label')) {
      expect(parseInt((label as HTMLElement).style.width, 10)).toBeGreaterThanOrEqual(24);
      expect(parseInt((label as HTMLElement).style.height, 10)).toBeGreaterThanOrEqual(24);
    }
  });
});
