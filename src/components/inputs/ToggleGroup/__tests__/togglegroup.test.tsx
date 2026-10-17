import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToggleGroup } from '../ToggleGroup';

const ITEMS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board' },
];

/**
 * The two kinds of group are announced differently AND reached differently, and
 * getting that wrong is how a group becomes unreachable rather than merely
 * mislabelled.
 */
describe('ToggleGroup — single is a radio group wearing buttons', () => {
  it('announces itself as a radio group, with a name', () => {
    render(<ToggleGroup label="View" items={ITEMS} value="grid" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('says WHICH one is chosen, which a row of buttons cannot', () => {
    render(<ToggleGroup label="View" items={ITEMS} value="grid" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Grid' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'List' }).getAttribute('aria-checked')).toBe('false');
  });

  it('is ONE tab stop, and the arrows move within it', () => {
    render(<ToggleGroup label="View" items={ITEMS} value="grid" onChange={() => {}} />);
    const tabbable = screen.getAllByRole('radio').filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute('aria-checked')).toBe('true');
  });

  it('an EMPTY single group is still reachable — the first takes the stop', () => {
    render(<ToggleGroup label="View" items={ITEMS} value="" onChange={() => {}} />);
    const tabbable = screen.getAllByRole('radio').filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('→ chooses the next one, and reports it', () => {
    const onChange = vi.fn();
    render(<ToggleGroup label="View" items={ITEMS} value="list" onChange={onChange} />);
    const list = screen.getByRole('radio', { name: 'List' });
    list.focus();
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('grid');
  });

  it('choosing one replaces the other, because that is what single means', () => {
    const onChange = vi.fn();
    render(<ToggleGroup label="View" items={ITEMS} value="list" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Board' }));
    expect(onChange).toHaveBeenCalledWith('board');
  });
});

describe('ToggleGroup — multiple is a group of independent switches', () => {
  it('announces itself as a group of pressed buttons, not a radio group', () => {
    render(<ToggleGroup label="Filters" type="multiple" items={ITEMS} value={['list']} onChange={() => {}} />);
    expect(screen.getByRole('group', { name: 'Filters' })).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'List' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('is one stop PER SWITCH, because they are independent', () => {
    // A reader may want to toggle the third without passing through the first
    // two. Applying the radio keyboard here is how a group becomes unreachable.
    render(<ToggleGroup label="Filters" type="multiple" items={ITEMS} value={[]} onChange={() => {}} />);
    for (const b of screen.getAllByRole('button')) expect(b.getAttribute('tabindex')).toBe('0');
  });

  it('toggling one does not clear the others', () => {
    const onChange = vi.fn();
    render(<ToggleGroup label="Filters" type="multiple" items={ITEMS} value={['list']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
    expect(onChange).toHaveBeenCalledWith(['list', 'grid']);
  });

  it('toggling one off removes only it', () => {
    const onChange = vi.fn();
    render(<ToggleGroup label="Filters" type="multiple" items={ITEMS} value={['list', 'grid']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(onChange).toHaveBeenCalledWith(['grid']);
  });
});

describe('ToggleGroup — disabled', () => {
  it('a disabled group does not change', () => {
    const onChange = vi.fn();
    render(<ToggleGroup label="View" items={ITEMS} value="list" onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a disabled ITEM does not change, and the rest do', () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup label="View" items={[ITEMS[0], { ...ITEMS[1], disabled: true }, ITEMS[2]]} value="list" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('radio', { name: 'Board' }));
    expect(onChange).toHaveBeenCalledWith('board');
  });
});
