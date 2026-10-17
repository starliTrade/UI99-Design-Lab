import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Stepper } from '../Stepper';

const STEPS = [
  { id: 'one', label: 'Account' },
  { id: 'two', label: 'Details' },
  { id: 'three', label: 'Confirm' },
];

describe('Stepper — a sequence is an ordered list', () => {
  it('is a list, because a sequence IS ordered', () => {
    render(<Stepper steps={STEPS} current="two" />);
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('says WHICH step the reader is on, with the attribute that exists for it', () => {
    // A stepper without `aria-current` is a row of circles.
    render(<Stepper steps={STEPS} current="two" />);
    const items = screen.getAllByRole('listitem');
    expect(items[0].getAttribute('aria-current')).toBeNull();
    expect(items[1].getAttribute('aria-current')).toBe('step');
    expect(items[2].getAttribute('aria-current')).toBeNull();
  });

  it('the labels are readable text, not only a number', () => {
    render(<Stepper steps={STEPS} current="two" />);
    for (const s of STEPS) expect(screen.getByText(s.label)).toBeTruthy();
  });
});

describe('Stepper — the state is derived, not hand-set', () => {
  it('everything before the current step is complete', () => {
    render(<Stepper steps={STEPS} current="three" />);
    // The glyph is the only visible mark of completion, and it is aria-hidden —
    // the state is carried by position in the list and by `aria-current`.
    // Scoped to each item: the connector is `aria-hidden` too, and a document
    // query picks up whatever else is on the page.
    const items = screen.getAllByRole('listitem');
    const dotText = (li: HTMLElement) => li.querySelector('span[aria-hidden]')?.textContent;
    expect(dotText(items[0] as HTMLElement)).toBe('✓');
    expect(dotText(items[1] as HTMLElement)).toBe('✓');
    expect(dotText(items[2] as HTMLElement)).toBe('3');
  });

  it('an explicit error beats the derived state', () => {
    render(<Stepper steps={[{ id: 'one', label: 'Account', state: 'error' }, ...STEPS.slice(1)]} current="one" />);
    const items = screen.getAllByRole('listitem');
    // An error is not "current", even when it is the step the reader is on.
    expect(items[0].getAttribute('aria-current')).toBeNull();
  });

  it('with no current step, nothing claims to be current', () => {
    render(<Stepper steps={STEPS} />);
    for (const item of screen.getAllByRole('listitem')) {
      expect(item.getAttribute('aria-current')).toBeNull();
    }
  });
});

describe('Stepper — it declares its own surface', () => {
  it('is a chrome surface, so it can be anchored anywhere', () => {
    const { container } = render(<Stepper steps={STEPS} current="one" />);
    const list = container.querySelector('ol') as HTMLElement;
    // The engine's rim, not a flat fill: a stepper is an object in the frame.
    expect(list.style.backgroundImage !== 'none' || list.style.backgroundColor !== '').toBe(true);
  });

  it('renders both orientations without changing its structure', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const { container, unmount } = render(<Stepper steps={STEPS} current="two" orientation={orientation} />);
      expect(container.querySelectorAll('li')).toHaveLength(3);
      unmount();
    }
  });
});
